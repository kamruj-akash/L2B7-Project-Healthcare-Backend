import httpStatus from "http-status";
import { AppointmentStatus } from "../../../generated/prisma/enums";
import { generatePrescriptionPdf } from "../../lib/pdfKit";
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
		include: {
			Patient: true,
		},
	});
	if (!appointment) {
		throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	}
	if (appointment.doctorId !== doctor.id) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not assigned to this appointment",
		);
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
	const generatedPrescription = await generatePrescriptionPdf({
		prescriptionId: appointment.id,
		issuedAt: new Date(),
		doctor: {
			name: doctor.name,
			specialization: doctor.specialization,
			qualification: doctor.qualification,
			licenseNumber: doctor.licenseNumber,
			contactNumber: doctor.contactNumber,
			email: doctor.email,
		},
		patient: {
			name: appointment.Patient.name,
			email: appointment.Patient.email,
			contactNumber: appointment.Patient.contactNumber,
			address: appointment.Patient.address,
		},
		appointment: {
			serialNumber: appointment.serialNumber,
			joiningTime: appointment.joiningTime,
		},
		findings: payload.findings,
		medicines: payload.medicines,
	});
    
};

export const prescriptionService = {
	createPrescription,
};
