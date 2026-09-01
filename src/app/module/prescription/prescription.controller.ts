import { Request, Response } from "express";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { prescriptionService } from "./prescription.service";

const createPrescription = catchAsync(async (req: Request, res: Response) => {
	const result = await prescriptionService.createPrescription(
		req.body,
		req.user as RequestUser,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Prescription created successfully",
		data: result,
	});
});

const getSinglePrescription = catchAsync(
	async (req: Request, res: Response) => {
		const result = await prescriptionService.getSinglePrescription(
			req.params.id as string,
			req.user as RequestUser,
		);
		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Prescription fetched successfully",
			data: result,
		});
	},
);

export const prescriptionController = {
	createPrescription,
	getSinglePrescription,
};
