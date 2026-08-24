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

export const AppointmentController = {
	bookAppointment,
	bkashCallback,
	payAppointment,
	cancelAppointment,
};
