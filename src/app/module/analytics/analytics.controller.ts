import { Request, Response } from "express";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { analyticsService } from "./analytics.service";

const adminAnalytics = catchAsync(async (_req: Request, res: Response) => {
	const result = await analyticsService.adminAnalytics();
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Admin analytics retrieved successfully",
		data: result,
	});
});

const doctorAnalytics = catchAsync(async (req: Request, res: Response) => {
	const result = await analyticsService.doctorAnalytics(
		req.user as RequestUser,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Doctor analytics retrieved successfully",
		data: result,
	});
});

const patientAnalytics = catchAsync(async (req: Request, res: Response) => {
	const result = await analyticsService.patientAnalytics(
		req.user as RequestUser,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Patient analytics retrieved successfully",
		data: result,
	});
});

export const analyticsController = {
	adminAnalytics,
	doctorAnalytics,
	patientAnalytics,
};
