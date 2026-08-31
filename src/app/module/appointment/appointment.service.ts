import { addMinutes, isBefore, subHours } from "date-fns";
import httpStatus from "http-status";
import {
	AppointmentStatus,
	PaymentStatus,
} from "../../../generated/prisma/browser";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { sendAppointmentConfirmationEmail } from "../../lib/resend";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/appError";

const bookAppointment = async (payload: any, user: RequestUser) => {
	const idToken = await getBkashIdToken();

	const transaction = await prisma.$transaction(async (tx) => {
		const appointment = await tx.appointment.create({
			data: {
				status: AppointmentStatus.PENDING,
				patientId: user.userId,
				doctorId: payload.doctorId,
				scheduleId: payload.scheduleId,
			},
		});

		const response = await fetch(
			`${config.bkash_url}/tokenized/checkout/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: idToken as string,
					"X-App-Key": config.bkash_app_key as string,
				},
				body: JSON.stringify({
					mode: "0011",
					payerReference: user.phoneNo || user.email,
					callbackURL: `${config.backend_url}/api/v1/appointment/callback/bkash`,
					amount: "500",
					currency: "BDT",
					intent: "sale",
					merchantInvoiceNumber: appointment.id,
				}),
			},
		);

		const result = await response.json();

		await tx.payment.create({
			data: {
				merchantInvoiceNumber: result.merchantInvoiceNumber,
				appointmentId: appointment.id,
				amount: "500",
				gatewayResponse: result,
				bkashPaymentId: result.paymentID,
				payerReference: user.phoneNo || user.email,
			},
		});

		if (result.statusCode !== "0000") {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				result.statusMessage || "bKash payment creation failed",
			);
		}

		return result.bkashURL;
	});
	return transaction;
};

const bkashCallback = async (query: Record<string, any>) => {
	const transaction = await prisma.$transaction(async (tx) => {
		const { paymentID, status, signature } = query;
		if (!paymentID)
			throw new AppError(httpStatus.BAD_REQUEST, "Payment Id is Missing");
		if (!status)
			throw new AppError(httpStatus.BAD_REQUEST, "Status is Missing");
		if (!signature)
			throw new AppError(httpStatus.BAD_REQUEST, "Signature is Missing");

		const idToken = await getBkashIdToken();
		if (!idToken)
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Failed to get bKash ID Token",
			);

		const response = await fetch(
			`${config.bkash_url}/tokenized/checkout/execute`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: idToken as string,
					"X-App-Key": config.bkash_app_key as string,
				},
				body: JSON.stringify({ paymentID: paymentID }),
			},
		);
		const result = await response.json();

		if (status === "success") {
			const appointment = await tx.appointment.findUnique({
				where: { id: result.merchantInvoiceNumber },
				include: { Schedule: true, Patient: true, Doctor: true, payment: true },
			});
			if (!appointment) {
				throw new AppError(
					httpStatus.NOT_FOUND,
					"Appointment not found for payment update",
				);
			}

			// bKash can hit the callback more than once — don't book the slot,
			// or send the confirmation mail, twice.
			if (appointment.status === AppointmentStatus.CONFIRMED) {
				return {
					redirectUrl: `${config.frontend_url}/dashboard/appointments?status=success`,
				};
			}

			const newAvailableSlots = appointment.Schedule.availableSlot - 1;
			const serialNumber = appointment.Schedule.totalSlot - newAvailableSlots;

			const joiningTime = addMinutes(
				appointment.Schedule.startDateTime,
				(serialNumber - 1) * 20,
			);

			await tx.schedule.update({
				where: { id: appointment.scheduleId },
				data: { availableSlot: newAvailableSlots },
			});
			await tx.appointment.update({
				where: { id: result.merchantInvoiceNumber },
				data: {
					serialNumber,
					joiningTime,
					status: AppointmentStatus.CONFIRMED,
					gatewayResponse: result,
				},
			});

			const updatedPayment = await tx.payment.update({
				where: { merchantInvoiceNumber: result.merchantInvoiceNumber },
				data: {
					status: PaymentStatus.PAID,
					bkashTrxId: result.trxID,
					paidAt: result.paymentExecuteTime,
					gatewayResponse: result,
					bkashPaymentId: result.paymentID,
					payerReference: result.payerReference,
					amount: result.amount,
				},
			});

			return {
				redirectUrl: `${config.frontend_url}/dashboard/appointments?status=success`,
				confirmation: {
					email: appointment.Patient.email,
					patientName: appointment.Patient.name,
					doctorName: appointment.Doctor.name,
					meetingLink: appointment.Schedule.meetingLink,
					joiningTime,
					serialNumber,
					invoice: {
						patientName: appointment.Patient.name,
						doctorName: appointment.Doctor.name,
						serialNumber,
						joiningTime,
						amount: updatedPayment.amount.toFixed(2),
						status: updatedPayment.status,
						bkashTrxId: updatedPayment.bkashTrxId ?? "N/A",
						paidAt: updatedPayment.paidAt ?? new Date().toLocaleString(),
					},
				},
			};
		} else if (status === "failure") {
			await tx.payment.update({
				where: {
					bkashPaymentId: result.paymentID || paymentID,
				},
				data: {
					status: PaymentStatus.FAILED,
					gatewayResponse: result,
				},
			});
			return {
				redirectUrl: `${config.frontend_url}/dashboard/appointments?status=failure`,
			};
		} else if (status === "cancel") {
			await tx.appointment.update({
				where: { id: result.merchantInvoiceNumber },
				data: {
					status: AppointmentStatus.CANCELED,
					gatewayResponse: result,
				},
			});
			return {
				redirectUrl: `${config.frontend_url}/dashboard/appointments?status=cancel`,
			};
		} else {
			return {
				redirectUrl: `${config.frontend_url}/dashboard/appointments?status=unknown`,
			};
		}
	});

	if (transaction.confirmation) {
		// The payment is already committed — a mail failure must not fail the callback.
		try {
			await sendAppointmentConfirmationEmail(transaction.confirmation);
		} catch (error) {
			console.error("Failed to send appointment confirmation email:", error);
		}
	}

	return { redirectUrl: transaction.redirectUrl };
};

const payAppointment = async (appointmentId: string, user: RequestUser) => {
	const idToken = await getBkashIdToken();
	const appointment = await prisma.appointment.findUnique({
		where: { id: appointmentId },
		include: { payment: true },
	});

	if (!appointment)
		throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	if (
		appointment.payment?.status === PaymentStatus.PAID ||
		appointment.status === AppointmentStatus.CONFIRMED
	) {
		throw new AppError(httpStatus.CONFLICT, "Appointment already paid");
	}

	const response = await fetch(
		`${config.bkash_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: idToken as string,
				"X-App-Key": config.bkash_app_key as string,
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference: user.phoneNo || user.email,
				callbackURL: `${config.backend_url}/api/v1/appointment/callback/bkash`,
				amount: "500",
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: appointment.id,
			}),
		},
	);
	const { bkashURL } = await response.json();
	return { redirectUrl: bkashURL };
};

const cancelAppointment = async (appointmentId: string, user: RequestUser) => {
	const idToken = await getBkashIdToken();
	const appointment = await prisma.appointment.findUnique({
		where: { id: appointmentId, Patient: { id: user.userId } },
		include: { payment: true, Schedule: true, Doctor: true, Patient: true },
	});

	if (!appointment)
		throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	if (
		appointment.status === AppointmentStatus.CANCELED ||
		appointment.status === AppointmentStatus.COMPLETED ||
		appointment.status === AppointmentStatus.ONGOING
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Appointment cannot be canceled",
		);
	}
	await prisma.appointment.update({
		where: { id: appointmentId },
		data: { status: AppointmentStatus.CANCELED },
	});

	await prisma.schedule.update({
		where: { id: appointment.scheduleId },
		data: { availableSlot: { increment: 1 } },
	});

	const isRefundable = isBefore(
		new Date(),
		subHours(appointment.Schedule.startDateTime, 1),
	);

	if (!isRefundable) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Appointment cannot be refunded as it is less than 1 hour before the scheduled time",
		);
	}

	const result = prisma.$transaction(async (tx) => {
		const response = await fetch(
			`${config.bkash_url}/tokenized/checkout/payment/refund`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: idToken as string,
					"X-App-Key": config.bkash_app_key as string,
				},
				body: JSON.stringify({
					paymentID: appointment.payment?.bkashPaymentId,
					trxID: appointment.payment?.bkashTrxId,
					amount: appointment.payment?.amount.toString(),
					sku: appointment.id,
					reason: "Appointment canceled by user",
				}),
			},
		);

		const result = await response.json();
		// console.log("bKash refund result", result);
		if (result.statusCode !== "0000") {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				result.statusMessage || "bKash refund failed",
			);
		}

		await tx.payment.update({
			where: { merchantInvoiceNumber: appointment.id },
			data: {
				status: PaymentStatus.REFUNDED,
				gatewayResponse: result,
			},
		});

		await tx.payment.update({
			where: { merchantInvoiceNumber: appointment.id },
			data: {
				status: PaymentStatus.REFUNDED,
				gatewayResponse: result,
				refundTrxId: result.refundTrxID,
				refundAmount: result.amount,
				refundReason: "Appointment canceled by user",
				refundedAt: result.completedTime,
			},
		});
		return result;
	});

	return result;
};

const updateAppointment = async (
	appointmentId: string,
	status: "COMPLETED" | "ONGOING",
	user: RequestUser,
) => {
	const doctor = await prisma.doctor.findUnique({
		where: { id: user.userId },
	});
	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	const appointment = await prisma.appointment.findUnique({
		where: { id: appointmentId },
		include: { Doctor: true },
	});
	if (!appointment) {
		throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	}
	if (appointment.doctorId !== doctor.id) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not authorized to update this appointment",
		);
	}
	if (
		appointment.status === AppointmentStatus.COMPLETED ||
		appointment.status === AppointmentStatus.CANCELED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Appointment cannot be updated as it is already completed or canceled",
		);
	}
	if (appointment.status === AppointmentStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Appointment cannot be updated as it is still pending",
		);
	}

	const updatedAppointment = await prisma.appointment.update({
		where: { id: appointmentId },
		data: { status: status as AppointmentStatus },
	});
	return updatedAppointment;
};

export const AppointmentService = {
	bookAppointment,
	bkashCallback,
	payAppointment,
	cancelAppointment,
	updateAppointment,
};
