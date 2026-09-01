import { addDays, isAfter, isSameDay, isToday, startOfDay } from "date-fns";
import { differenceInMinutes } from "date-fns/fp";
import httpStatus from "http-status";
import { ScheduleStatus } from "../../../generated/prisma/enums";
import { ScheduleWhereInput } from "../../../generated/prisma/models";
import { IQuery } from "../../interface";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/appError";
import { ICreateSchedule, IUpdateSchedule } from "./schedule.interface";

const createSchedule = async (user: RequestUser, payload: ICreateSchedule) => {
	const findDoctor = await prisma.doctor.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!findDoctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	if (!isSameDay(payload.startDateTime, payload.endDateTime)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Start and End DateTime must be on the same day",
		);
	}
	if (!isToday(payload.startDateTime)) {
		throw new AppError(httpStatus.BAD_REQUEST, "Start DateTime must be today!");
	}
	if (!isAfter(payload.endDateTime, payload.startDateTime)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"End DateTime must be after Start DateTime",
		);
	}

	const startOfTheDay = startOfDay(payload.startDateTime);
	const startOfNextDay = addDays(startOfTheDay, 1);
	const totalScheduleMin = differenceInMinutes(
		payload.startDateTime,
		payload.endDateTime,
	);
	const totalSlot = totalScheduleMin / 20;

	const isScheduleAvailable = await prisma.schedule.findFirst({
		where: {
			doctorId: findDoctor.id,
			isDeleted: false,
			startDateTime: {
				gte: startOfTheDay,
				lt: startOfNextDay,
			},
		},
	});
	if (isScheduleAvailable) {
		throw new AppError(
			httpStatus.CONFLICT,
			"You Have Schedule on this Day! Please Try Tomorrow",
		);
	}

	const schedule = await prisma.schedule.create({
		data: {
			availableSlot: totalSlot,
			meetingLink: payload.meetingLink,
			totalSlot,
			startDateTime: payload.startDateTime,
			endDateTime: payload.endDateTime,
			doctorId: findDoctor.id,
		},
		include: {
			doctor: true,
		},
	});

	return schedule;
};

const updateSchedule = async (
	scheduleId: string,
	user: RequestUser,
	payload: IUpdateSchedule,
) => {
	const findDoctor = await prisma.doctor.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!findDoctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	const schedule = await prisma.schedule.findUnique({
		where: {
			id: scheduleId,
		},
	});

	if (!schedule || schedule.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
	}

	if (
		schedule.status === ScheduleStatus.PUBLISHED &&
		schedule.totalSlot !== schedule.availableSlot
	) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Cannot update published schedule",
		);
	}

	const ownerCheck = schedule.doctorId === findDoctor.id;
	if (!ownerCheck) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not authorized to update this schedule",
		);
	}

	payload.startDateTime = payload.startDateTime || schedule.startDateTime;
	payload.endDateTime = payload.endDateTime || schedule.endDateTime;

	const startOfTheDay = startOfDay(payload.startDateTime);
	const startOfNextDay = addDays(startOfTheDay, 1);
	// const totalScheduleMin = differenceInMinutes(startOfTheDay, startOfNextDay);
	// const totalSlot = totalScheduleMin / 20;

	if (!isSameDay(payload.startDateTime, payload.endDateTime)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Start and End DateTime must be on the same day",
		);
	}
	if (!isToday(payload.startDateTime)) {
		throw new AppError(httpStatus.BAD_REQUEST, "Start DateTime must be today!");
	}
	if (!isAfter(payload.endDateTime, payload.startDateTime)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"End DateTime must be after Start DateTime",
		);
	}

	const updatedSchedule = await prisma.schedule.update({
		where: {
			id: scheduleId,
			doctorId: findDoctor.id,
		},
		data: {
			meetingLink: payload.meetingLink || schedule.meetingLink,
			startDateTime: startOfTheDay,
			endDateTime: startOfNextDay,
		},
	});

	return updatedSchedule;
};

const getMySchedule = async (query: IQuery, user: RequestUser) => {
	console.log(user);
	const findDoctor = await prisma.doctor.findUnique({
		where: {
			email: user.email,
			userId: user.userId,
		},
	});
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = query.skip ? Number(page - 1) * limit : 0;
	const orderBy = query.orderBy ? query.orderBy : { createdAt: "desc" };

	if (!findDoctor) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Doctor Not Found, please apply as a Doctor!",
		);
	}
	const andConditions: ScheduleWhereInput[] = [
		{ doctorId: findDoctor.id },
		{ isDeleted: false },
	];
	if (query.status) {
		andConditions.push({ status: query.status });
	}
	const doctorSchedule = await prisma.schedule.findMany({
		where: {
			AND: andConditions,
		},
		skip,
		take: limit,
		orderBy,
		include: {
			Appointments: {
				include: {
					Patient: true,
				},
			},
		},
	});
	const totalCount = await prisma.schedule.count({
		where: {
			AND: andConditions,
		},
	});

	// if (!doctorSchedule) {
	// 	throw new AppError(httpStatus.NOT_FOUND, "No Schedule Found");
	// }

	return {
		data: doctorSchedule,
		meta: {
			total: totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
		},
	};
};

const getAllSchedules = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = query.skip ? Number(page - 1) * limit : 0;
	const orderBy = query.orderBy ? query.orderBy : { createdAt: "desc" };
	const andConditions: ScheduleWhereInput[] = [];

	if (query.doctorId) {
		andConditions.push({ doctorId: query.doctorId });
	}
	if (query.email) {
		andConditions.push({
			doctor: {
				email: query.email,
			},
		});
	}
	if (query.status) {
		andConditions.push({ status: query.status });
	}
	if (query.scheduleId) {
		andConditions.push({ id: query.scheduleId });
	}
	if (query.searchTerm) {
		andConditions.push({
			doctor: {
				OR: [
					{ name: { contains: query.searchTerm, mode: "insensitive" } },
					{ email: { contains: query.searchTerm, mode: "insensitive" } },
					{
						specialization: { contains: query.searchTerm, mode: "insensitive" },
					},
				],
			},
		});
	}

	const schedules = await prisma.schedule.findMany({
		where: {
			AND: andConditions,
		},
		skip,
		take: limit,
		orderBy,
		include: {
			doctor: true,
			Appointments: {
				include: {
					Patient: true,
				},
			},
		},
	});
	const totalCount = await prisma.schedule.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		data: schedules,
		meta: {
			total: totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
		},
	};
};

const getScheduleById = async (scheduleId: string) => {
	const schedule = await prisma.schedule.findUnique({
		where: {
			id: scheduleId,
		},
		include: {
			doctor: true,
			Appointments: {
				include: {
					Patient: true,
				},
			},
		},
	});

	if (!schedule || schedule.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
	}

	return schedule;
};

const publishSchedule = async (scheduleId: string, user: RequestUser) => {
	const findDoctor = await prisma.doctor.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!findDoctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	const schedule = await prisma.schedule.findUnique({
		where: {
			id: scheduleId,
		},
	});

	if (!schedule || schedule.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
	}

	if (
		schedule.status === ScheduleStatus.PUBLISHED &&
		schedule.totalSlot !== schedule.availableSlot
	) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Cannot Publish schedule, it's already published and has appointments",
		);
	}

	const ownerCheck = schedule.doctorId === findDoctor.id;
	if (!ownerCheck) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not authorized to publish this schedule",
		);
	}
	const publishedSchedule = await prisma.schedule.update({
		where: {
			id: scheduleId,
		},
		data: {
			status: ScheduleStatus.PUBLISHED,
		},
	});

	return publishedSchedule;
};
const deleteSchedule = async (scheduleId: string, user: RequestUser) => {
	const findDoctor = await prisma.doctor.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!findDoctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	const schedule = await prisma.schedule.findUnique({
		where: {
			id: scheduleId,
		},
	});

	if (!schedule || schedule.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
	}

	if (
		schedule.status === ScheduleStatus.PUBLISHED &&
		schedule.totalSlot !== schedule.availableSlot
	) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Cannot delete schedule, it's already published and has appointments",
		);
	}

	const ownerCheck = schedule.doctorId === findDoctor.id;
	if (!ownerCheck) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not authorized to delete this schedule",
		);
	}
	const deletedSchedule = await prisma.schedule.update({
		where: {
			id: scheduleId,
		},
		data: {
			isDeleted: true,
		},
	});

	return deletedSchedule;
};
const getScheduleByDoctorId = async (doctorId: string) => {
	const findDoctor = await prisma.doctor.findUnique({
		where: {
			id: doctorId,
		},
	});
	if (!findDoctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}
	const startOfTheDay = startOfDay(new Date());
	const startOfNextDay = addDays(startOfTheDay, 1);
	const now = new Date();

	const andConditions: ScheduleWhereInput[] = [
		{ doctorId: findDoctor.id },
		{ isDeleted: false },
		{ status: ScheduleStatus.PUBLISHED },
		{ startDateTime: { gte: startOfTheDay, lt: startOfNextDay, gt: now } },
		{ availableSlot: { gt: 0 } },
	];

	const schedules = await prisma.schedule.findMany({
		where: {
			AND: andConditions,
		},
	});
	return schedules;
};

export const scheduleService = {
	createSchedule,
	getMySchedule,
	getAllSchedules,
	getScheduleById,
	updateSchedule,
	publishSchedule,
	deleteSchedule,
	getScheduleByDoctorId,
};
