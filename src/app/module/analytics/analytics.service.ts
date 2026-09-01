import { addDays, format, startOfDay, subDays } from "date-fns";
import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import {
	AppointmentStatus,
	DoctorVerificationStatus,
	PaymentStatus,
	ScheduleStatus,
} from "../../../generated/prisma/enums";
import { AppointmentWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/appError";

const TREND_DAYS = 30;

// Prisma returns money columns as Decimal, which JSON serializes to a string.
// Analytics responses hand back numbers so the client can chart and sum them.
const toNumber = (value: Prisma.Decimal | null) =>
	value ? value.toNumber() : 0;

const toPercentage = (part: number, total: number) =>
	total > 0 ? Number(((part / total) * 100).toFixed(2)) : 0;

// Appointment counts per day for the last 30 days. Days with no appointments
// are kept at 0 so the client gets a continuous series to chart.
const getAppointmentsByDay = async (where: AppointmentWhereInput) => {
	const startDate = startOfDay(subDays(new Date(), TREND_DAYS - 1));

	const appointments = await prisma.appointment.findMany({
		where: {
			AND: [where, { createdAt: { gte: startDate } }],
		},
		select: {
			createdAt: true,
		},
	});

	const countByDay: Record<string, number> = {};
	for (let day = 0; day < TREND_DAYS; day++) {
		countByDay[format(addDays(startDate, day), "yyyy-MM-dd")] = 0;
	}

	for (const appointment of appointments) {
		const day = format(appointment.createdAt, "yyyy-MM-dd");
		if (countByDay[day] !== undefined) {
			countByDay[day] += 1;
		}
	}

	return Object.entries(countByDay).map(([date, count]) => ({ date, count }));
};

const adminAnalytics = async () => {
	const totalUsers = await prisma.user.count({
		where: { isDeleted: false },
	});
	const totalAppointments = await prisma.appointment.count();
	const totalPatients = await prisma.patient.count({
		where: { isDeleted: false },
	});
	const totalDoctors = await prisma.doctor.count({
		where: { isDeleted: false },
	});
	const totalPayments = await prisma.payment.count();
	const totalSchedules = await prisma.schedule.count({
		where: { isDeleted: false },
	});
	const totalCompletedAppointments = await prisma.appointment.count({
		where: {
			status: AppointmentStatus.COMPLETED,
		},
	});
	const totalPendingAppointments = await prisma.appointment.count({
		where: {
			status: AppointmentStatus.PENDING,
		},
	});
	const totalConfirmedAppointments = await prisma.appointment.count({
		where: {
			status: AppointmentStatus.CONFIRMED,
		},
	});
	const totalOngoingAppointments = await prisma.appointment.count({
		where: {
			status: AppointmentStatus.ONGOING,
		},
	});
	const totalCancelledAppointments = await prisma.appointment.count({
		where: {
			status: AppointmentStatus.CANCELED,
		},
	});
	const totalPrescriptions = await prisma.appointment.count({
		where: {
			prescriptionUrl: { not: Prisma.DbNull },
		},
	});

	const totalRevenue = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.PAID,
		},
		_sum: {
			amount: true,
		},
	});
	const totalRefunds = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.REFUNDED,
		},
		_sum: {
			amount: true,
		},
	});
	const unpaidRevenue = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.UNPAID,
		},
		_sum: {
			amount: true,
		},
	});

	const pendingDoctors = await prisma.doctor.count({
		where: {
			isDeleted: false,
			verificationStatus: DoctorVerificationStatus.PENDING,
		},
	});
	const approvedDoctors = await prisma.doctor.count({
		where: {
			isDeleted: false,
			verificationStatus: DoctorVerificationStatus.APPROVE,
		},
	});
	const rejectedDoctors = await prisma.doctor.count({
		where: {
			isDeleted: false,
			verificationStatus: DoctorVerificationStatus.REJECTED,
		},
	});

	// Five doctors with the most appointments, with their profile joined back in.
	const topDoctorGroups = await prisma.appointment.groupBy({
		by: ["doctorId"],
		_count: {
			id: true,
		},
		orderBy: {
			_count: {
				id: "desc",
			},
		},
		take: 5,
	});
	const topDoctorProfiles = await prisma.doctor.findMany({
		where: {
			id: { in: topDoctorGroups.map((group) => group.doctorId) },
		},
		select: {
			id: true,
			name: true,
			email: true,
			specialization: true,
		},
	});
	const topDoctors = topDoctorGroups.map((group) => {
		const doctor = topDoctorProfiles.find(
			(profile) => profile.id === group.doctorId,
		);
		return {
			doctorId: group.doctorId,
			name: doctor?.name || null,
			email: doctor?.email || null,
			specialization: doctor?.specialization || null,
			totalAppointments: group._count.id,
		};
	});

	const appointmentsByDay = await getAppointmentsByDay({});

	const revenue = toNumber(totalRevenue._sum.amount);
	const refunds = toNumber(totalRefunds._sum.amount);

	return {
		totalUsers,
		totalAppointments,
		totalPatients,
		totalDoctors,
		totalPayments,
		totalSchedules,
		totalPrescriptions,

		totalCompletedAppointments,
		totalPendingAppointments,
		totalConfirmedAppointments,
		totalOngoingAppointments,
		totalCancelledAppointments,
		completionRate: toPercentage(totalCompletedAppointments, totalAppointments),
		cancellationRate: toPercentage(
			totalCancelledAppointments,
			totalAppointments,
		),

		totalRevenue: revenue,
		totalRefunds: refunds,
		netRevenue: Number((revenue - refunds).toFixed(2)),
		unpaidRevenue: toNumber(unpaidRevenue._sum.amount),

		pendingDoctors,
		approvedDoctors,
		rejectedDoctors,

		topDoctors,
		appointmentsByDay,
	};
};

const doctorAnalytics = async (user: RequestUser) => {
	const doctor = await prisma.doctor.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	const now = new Date();

	const totalAppointments = await prisma.appointment.count({
		where: { doctorId: doctor.id },
	});
	const totalCompletedAppointments = await prisma.appointment.count({
		where: { doctorId: doctor.id, status: AppointmentStatus.COMPLETED },
	});
	const totalPendingAppointments = await prisma.appointment.count({
		where: { doctorId: doctor.id, status: AppointmentStatus.PENDING },
	});
	const totalConfirmedAppointments = await prisma.appointment.count({
		where: { doctorId: doctor.id, status: AppointmentStatus.CONFIRMED },
	});
	const totalOngoingAppointments = await prisma.appointment.count({
		where: { doctorId: doctor.id, status: AppointmentStatus.ONGOING },
	});
	const totalCancelledAppointments = await prisma.appointment.count({
		where: { doctorId: doctor.id, status: AppointmentStatus.CANCELED },
	});
	const totalPrescriptions = await prisma.appointment.count({
		where: {
			doctorId: doctor.id,
			prescriptionUrl: { not: Prisma.DbNull },
		},
	});

	// Booked and not finished yet, on a schedule that has not started.
	const upcomingAppointments = await prisma.appointment.count({
		where: {
			doctorId: doctor.id,
			status: {
				in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
			},
			Schedule: {
				startDateTime: { gte: now },
			},
		},
	});

	// Each appointment row is one patient visit, so distinct patients need a groupBy.
	const patientGroups = await prisma.appointment.groupBy({
		by: ["patientId"],
		where: { doctorId: doctor.id },
	});

	const totalSchedules = await prisma.schedule.count({
		where: { doctorId: doctor.id, isDeleted: false },
	});
	const publishedSchedules = await prisma.schedule.count({
		where: {
			doctorId: doctor.id,
			isDeleted: false,
			status: ScheduleStatus.PUBLISHED,
		},
	});
	const upcomingSchedules = await prisma.schedule.count({
		where: {
			doctorId: doctor.id,
			isDeleted: false,
			startDateTime: { gte: now },
		},
	});
	const slots = await prisma.schedule.aggregate({
		where: { doctorId: doctor.id, isDeleted: false },
		_sum: {
			totalSlot: true,
			availableSlot: true,
		},
	});

	const totalEarnings = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.PAID,
			appointment: { doctorId: doctor.id },
		},
		_sum: {
			amount: true,
		},
	});
	const totalRefunds = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.REFUNDED,
			appointment: { doctorId: doctor.id },
		},
		_sum: {
			amount: true,
		},
	});
	const pendingEarnings = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.UNPAID,
			appointment: { doctorId: doctor.id },
		},
		_sum: {
			amount: true,
		},
	});

	const recentAppointments = await prisma.appointment.findMany({
		where: { doctorId: doctor.id },
		orderBy: { createdAt: "desc" },
		take: 5,
		include: {
			Patient: {
				select: { id: true, name: true, email: true },
			},
			Schedule: {
				select: { startDateTime: true, endDateTime: true },
			},
			payment: {
				select: { status: true, amount: true },
			},
		},
	});

	const appointmentsByDay = await getAppointmentsByDay({ doctorId: doctor.id });

	const earnings = toNumber(totalEarnings._sum.amount);
	const refunds = toNumber(totalRefunds._sum.amount);
	const totalSlot = slots._sum.totalSlot || 0;
	const availableSlot = slots._sum.availableSlot || 0;
	const bookedSlot = totalSlot - availableSlot;

	return {
		doctorId: doctor.id,
		name: doctor.name,
		specialization: doctor.specialization,
		verificationStatus: doctor.verificationStatus,

		totalAppointments,
		totalPatients: patientGroups.length,
		totalPrescriptions,
		upcomingAppointments,

		totalCompletedAppointments,
		totalPendingAppointments,
		totalConfirmedAppointments,
		totalOngoingAppointments,
		totalCancelledAppointments,
		completionRate: toPercentage(totalCompletedAppointments, totalAppointments),
		cancellationRate: toPercentage(
			totalCancelledAppointments,
			totalAppointments,
		),

		totalSchedules,
		publishedSchedules,
		upcomingSchedules,
		totalSlot,
		bookedSlot,
		availableSlot,
		slotUtilizationRate: toPercentage(bookedSlot, totalSlot),

		totalEarnings: earnings,
		totalRefunds: refunds,
		netEarnings: Number((earnings - refunds).toFixed(2)),
		pendingEarnings: toNumber(pendingEarnings._sum.amount),

		recentAppointments,
		appointmentsByDay,
	};
};

const patientAnalytics = async (user: RequestUser) => {
	const patient = await prisma.patient.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!patient) {
		throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
	}

	const now = new Date();

	const totalAppointments = await prisma.appointment.count({
		where: { patientId: patient.id },
	});
	const totalCompletedAppointments = await prisma.appointment.count({
		where: { patientId: patient.id, status: AppointmentStatus.COMPLETED },
	});
	const totalPendingAppointments = await prisma.appointment.count({
		where: { patientId: patient.id, status: AppointmentStatus.PENDING },
	});
	const totalConfirmedAppointments = await prisma.appointment.count({
		where: { patientId: patient.id, status: AppointmentStatus.CONFIRMED },
	});
	const totalOngoingAppointments = await prisma.appointment.count({
		where: { patientId: patient.id, status: AppointmentStatus.ONGOING },
	});
	const totalCancelledAppointments = await prisma.appointment.count({
		where: { patientId: patient.id, status: AppointmentStatus.CANCELED },
	});
	const totalPrescriptions = await prisma.appointment.count({
		where: {
			patientId: patient.id,
			prescriptionUrl: { not: Prisma.DbNull },
		},
	});

	const doctorGroups = await prisma.appointment.groupBy({
		by: ["doctorId"],
		where: { patientId: patient.id },
	});

	const totalSpent = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.PAID,
			appointment: { patientId: patient.id },
		},
		_sum: {
			amount: true,
		},
	});
	const totalRefunds = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.REFUNDED,
			appointment: { patientId: patient.id },
		},
		_sum: {
			amount: true,
		},
	});
	const unpaidAmount = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.UNPAID,
			appointment: { patientId: patient.id },
		},
		_sum: {
			amount: true,
		},
	});

	const upcomingAppointments = await prisma.appointment.findMany({
		where: {
			patientId: patient.id,
			status: {
				in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
			},
			Schedule: {
				startDateTime: { gte: now },
			},
		},
		orderBy: {
			Schedule: {
				startDateTime: "asc",
			},
		},
		take: 5,
		include: {
			Doctor: {
				select: { id: true, name: true, specialization: true },
			},
			Schedule: {
				select: {
					startDateTime: true,
					endDateTime: true,
					meetingLink: true,
				},
			},
			payment: {
				select: { status: true, amount: true },
			},
		},
	});

	const recentAppointments = await prisma.appointment.findMany({
		where: { patientId: patient.id },
		orderBy: { createdAt: "desc" },
		take: 5,
		include: {
			Doctor: {
				select: { id: true, name: true, specialization: true },
			},
			Schedule: {
				select: { startDateTime: true, endDateTime: true },
			},
			payment: {
				select: { status: true, amount: true },
			},
		},
	});

	const appointmentsByDay = await getAppointmentsByDay({
		patientId: patient.id,
	});

	const spent = toNumber(totalSpent._sum.amount);
	const refunds = toNumber(totalRefunds._sum.amount);

	return {
		patientId: patient.id,
		name: patient.name,
		memberSince: patient.createdAt,

		totalAppointments,
		totalDoctorsVisited: doctorGroups.length,
		totalPrescriptions,
		upcomingAppointments: upcomingAppointments.length,

		totalCompletedAppointments,
		totalPendingAppointments,
		totalConfirmedAppointments,
		totalOngoingAppointments,
		totalCancelledAppointments,
		completionRate: toPercentage(totalCompletedAppointments, totalAppointments),
		cancellationRate: toPercentage(
			totalCancelledAppointments,
			totalAppointments,
		),

		totalSpent: spent,
		totalRefunds: refunds,
		netSpent: Number((spent - refunds).toFixed(2)),
		unpaidAmount: toNumber(unpaidAmount._sum.amount),

		upcomingAppointmentList: upcomingAppointments,
		recentAppointments,
		appointmentsByDay,
	};
};

export const analyticsService = {
	adminAnalytics,
	doctorAnalytics,
	patientAnalytics,
};
