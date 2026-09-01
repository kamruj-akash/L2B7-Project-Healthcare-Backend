import {
	AppointmentStatus,
	PaymentStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const adminAnalytics = async () => {
	const totalAppointments = await prisma.appointment.count();
	const totalPatients = await prisma.patient.count();
	const totalDoctors = await prisma.doctor.count();
	const totalPayments = await prisma.payment.count();
	const totalSchedules = await prisma.schedule.count();
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
	const totalCancelledAppointments = await prisma.appointment.count({
		where: {
			status: AppointmentStatus.CANCELED,
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
	const avgAppointmentByDay = await prisma.appointment.groupBy({
		by: ["createdAt"],
		_count: {
			id: true,
		},
	});
	const totalRefunds = await prisma.payment.groupBy({
		by: ["status"],
		where: {
			status: PaymentStatus.REFUNDED,
		},
		_sum: {
			amount: true,
		},
	});

	return {
		totalAppointments,
		totalPatients,
		totalDoctors,
		totalPayments,
		totalSchedules,
		totalCompletedAppointments,
		totalPendingAppointments,
		totalCancelledAppointments,
		avgAppointmentByDay,
		totalRevenue: totalRevenue._sum.amount || 0,
		totalRefunds: totalRefunds[0]?._sum.amount || 0,
	};
};

export const analyticsService = {
	adminAnalytics,
};
