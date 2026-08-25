import httpStatus from "http-status";
import {
	AppointmentStatus,
	PaymentStatus,
} from "../../../generated/prisma/browser";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/appError";

const bookAppointment = async (payload: any, user: RequestUser) => {
	const idToken = await getBkashIdToken();
	const transaction = await prisma.$transaction(async (tx) => {
		const appointment = await tx.appointment.create({
			data: {
				status: AppointmentStatus.PENDING,
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
			await tx.appointment.update({
				where: { id: result.merchantInvoiceNumber },
				data: { status: AppointmentStatus.CONFIRMED },
			});
			await tx.payment.update({
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

	return transaction;
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
		where: { id: appointmentId },
		include: { payment: true },
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

	const result = prisma.$transaction(async (tx) => {
		await tx.appointment.update({
			where: { id: appointmentId },
			data: { status: AppointmentStatus.CANCELED },
		});

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

export const AppointmentService = {
	bookAppointment,
	bkashCallback,
	payAppointment,
	cancelAppointment,
};
