import httpStatus from "http-status";
import { PaymentWhereInput } from "../../../generated/prisma/models";
import { IQuery } from "../../interface";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/appError";

const getMyPayments = async (query: IQuery, user: RequestUser) => {
	const patient = await prisma.patient.findUnique({
		where: {
			userId: user.userId,
		},
	});
	if (!patient) {
		throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
	}
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";
	const payments = await prisma.payment.findMany({
		where: { appointment: { patientId: patient.id } },
		orderBy: { [sortBy]: sortOrder },
		skip,
		take: limit,
	});

	return {
		data: payments,
		meta: {
			total: payments.length,
			page,
			limit,
		},
	};
};
const getAllPayments = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";

	const andConditions: PaymentWhereInput[] = [];
	if (query.status) {
		andConditions.push({ status: query.status });
	}
	if (query.patientEmail) {
		andConditions.push({
			appointment: {
				Patient: {
					email: { contains: query.patientEmail, mode: "insensitive" },
				},
			},
		});
	}
	if (query.startDate && query.endDate) {
		andConditions.push({
			createdAt: {
				gte: new Date(query.startDate),
				lte: new Date(query.endDate),
			},
		});
	}
	const payments = await prisma.payment.findMany({
		where: {
			AND: andConditions,
		},
		orderBy: { [sortBy]: sortOrder },
		skip,
		take: limit,
	});
	const totalPayments = await prisma.payment.count({
		where: {
			AND: andConditions,
		},
	});
	return {
		data: payments,
		meta: {
			total: totalPayments,
			page,
			limit,
		},
	};
};
const getSinglePayments = async (paymentId: string, user: RequestUser) => {
	const patient = await prisma.patient.findUnique({
		where: {
			userId: user.userId,
		},
	});
	if (!patient) {
		throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
	}
	const payment = await prisma.payment.findUnique({
		where: {
			id: paymentId,
			appointment: {
				patientId: patient.id,
			},
		},
	});
	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
	}
	return payment;
};

export const paymentService = {
	getMyPayments,
	getAllPayments,
	getSinglePayments,
};
