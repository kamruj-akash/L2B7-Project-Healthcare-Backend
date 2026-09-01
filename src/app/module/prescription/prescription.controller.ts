import httpStatus from "http-status";
import { AppointmentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/appError";
import { ICreatePrescription } from "./prescription.interface";

const createPrescription = async (
	payload: ICreatePrescription,
	user: RequestUser,
) => {
	const doctor = await prisma.doctor.findUnique({
		where: {
			userId: user.userId,
		},
	});
	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}
	const appointment = await prisma.appointment.findUnique({
		where: {
			id: payload.appointmentId,
		},
	});
	if (!appointment) {
		throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	}
	if (appointment.status !== AppointmentStatus.COMPLETED) {
		throw new AppError(httpStatus.BAD_REQUEST, "Appointment is not completed");
	}
	if (appointment.prescriptionUrl) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Prescription already created for this appointment",
		);
	}
	const generatedPrescription = "";
};

export const prescriptionService = {
	createPrescription,
};
