import { Request, Response } from "express";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
	const result = await paymentService.getMyPayments(
		req.query,
		req.user as RequestUser,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "My payments retrieved successfully",
		data: result,
	});
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
	const result = await paymentService.getAllPayments(req.query);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "All payments retrieved successfully",
		data: result,
	});
});

const getSinglePayments = catchAsync(async (req: Request, res: Response) => {
	const result = await paymentService.getSinglePayments(
		req.params.id as string,
		req.user as RequestUser,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Payment retrieved successfully",
		data: result,
	});
});

export const paymentController = {
	getMyPayments,
	getAllPayments,
	getSinglePayments,
};
