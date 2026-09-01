import { UploadApiResponse } from "cloudinary";
import httpStatus from "http-status";
import { AppointmentStatus } from "../../../generated/prisma/enums";
import cloudinary from "../../lib/cloudinary";
import { generatePrescriptionPdf } from "../../lib/pdfKit";
import { prisma } from "../../lib/prisma";
import { sendPrescriptionEmail } from "../../lib/resend";
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
	const generatedPrescriptionBuffer = await generatePrescriptionPdf({
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

	const uploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{ resource_type: "raw", folder: "prescriptions", format: "pdf" },
					(error, result) => {
						if (error) {
							reject(error);
						}
						if (!result) {
							return reject(
								new AppError(
									httpStatus.INTERNAL_SERVER_ERROR,
									"Failed to upload prescription PDF",
								),
							);
						}
						resolve(result);
					},
				)
				.end(generatedPrescriptionBuffer);
		},
	);

	const updatedAppointment = await prisma.appointment.update({
		where: {
			id: payload.appointmentId,
		},
		data: {
			prescriptionUrl: {
				url: uploadResult.secure_url,
				publicId: uploadResult.public_id,
			},
		},
	});

	await sendPrescriptionEmail(
		appointment.Patient.email,
		uploadResult.secure_url,
		generatedPrescriptionBuffer,
	);

	return updatedAppointment;
};

const getSinglePrescription = async (
	appointmentId: string,
	user: RequestUser,
) => {
	const appointment = await prisma.appointment.findUnique({
		where: {
			id: appointmentId,
		},
		include: {
			Patient: true,
			Doctor: true,
		},
	});

	if (!appointment) {
		throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	}
	if (
		appointment.Patient.userId !== user.userId &&
		appointment.Doctor.userId !== user.userId
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not authorized to view this prescription",
		);
	}
	if (!appointment.prescriptionUrl) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Prescription not retrieved for this appointment",
		);
	}
	return appointment.prescriptionUrl;
};

export const prescriptionService = {
	createPrescription,
	getSinglePrescription,
};
