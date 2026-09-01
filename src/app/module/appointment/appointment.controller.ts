// AppointmentService
import { Request, Response } from "express";
import httpStatus from "http-status";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppointmentService } from "./appointment.service";

const bookAppointment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user as RequestUser;

	const result = await AppointmentService.bookAppointment(payload, user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Please Payment to confirm your appointment!",
		data: result,
	});
});

const payAppointment = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as RequestUser;
	const { appointmentId } = req.body;
	const result = await AppointmentService.payAppointment(
		appointmentId as string,
		user,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment initiated successfully!",
		data: result,
	});
});

const bkashCallback = catchAsync(async (req: Request, res: Response) => {
	const { redirectUrl } = await AppointmentService.bkashCallback(req.query);
	console.log("redirectUrl", redirectUrl);
	res.redirect(redirectUrl);
});

const cancelAppointment = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as RequestUser;
	const { appointmentId } = req.body;
	const result = await AppointmentService.cancelAppointment(
		appointmentId,
		user,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Appointment canceled and refund initiated",
		data: result,
	});
});

const updateAppointment = catchAsync(async (req: Request, res: Response) => {
	const { appointmentId } = req.params;
	const { status } = req.body;
	const user = req.user as RequestUser;

	const result = await AppointmentService.updateAppointment(
		appointmentId as string,
		status,
		user,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Appointment updated successfully!",
		data: result,
	});
});

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
	const result = await AppointmentService.getAllAppointments(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All appointments fetched successfully!",
		data: result,
	});
});

const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as RequestUser;
	const result = await AppointmentService.getMyAppointments(req.query, user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My appointments fetched successfully!",
		data: result,
	});
});

const getDoctorAppointments = catchAsync(
	async (req: Request, res: Response) => {
		const user = req.user as RequestUser;
		const result = await AppointmentService.getDoctorAppointments(
			req.query,
			user,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Doctor appointments fetched successfully!",
			data: result,
		});
	},
);
const getSingleAppointments = catchAsync(
	async (req: Request, res: Response) => {
		const { appointmentId } = req.params;
		const user = req.user as RequestUser;
		const result = await AppointmentService.getSingleAppointments(
			appointmentId as string,
			user,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Appointment fetched successfully!",
			data: result,
		});
	},
);

export const AppointmentController = {
	bookAppointment,
	bkashCallback,
	payAppointment,
	cancelAppointment,
	updateAppointment,
	getMyAppointments,
	getDoctorAppointments,
	getSingleAppointments,
	getAllAppointments,
};
