import { DoctorVerificationStatus } from "../../../generated/prisma/enums";

export interface IApplyDoctor {
	name: string;
	email: string;
	password: string;
}

export interface IVerifyDoctor {
	email: string;
	otp: string;

	specialization: string;
	licenseNumber: string;
	qualification: string;
	expYear: number;
	bio?: string;
	consultationFee?: string;
	contactNumber: string;
}

export interface IApproveDoctorPayload {
	doctorId: string;
	verificationStatus: DoctorVerificationStatus;
	rejectionReason?: string;
}
