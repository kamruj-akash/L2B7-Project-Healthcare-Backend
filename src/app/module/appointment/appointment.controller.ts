// AppointmentService
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppointmentService } from "./appointment.service";

const bookAppointment = catchAsync(async (req: Request, res: Response) => {
	const result = await AppointmentService.bookAppointment();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Please Payment to confirm your appointment!",
		data: result,
	});
});

const bkashCallback = catchAsync(async (req: Request, res: Response) => {
	const result = await AppointmentService.bkashCallback(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message:
			"Your appointment is confirmed! Please check your email for confirmation!",
		data: result,
	});
});

// const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
// 	const result = await AppointmentService.getAllAppointments();

// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "All appointments retrieved successfully!",
// 		data: result,
// 	});
// }

export const AppointmentController = {
	bookAppointment,
	bkashCallback,
};
