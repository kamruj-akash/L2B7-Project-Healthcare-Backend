import { Role } from "../../../generated/prisma/enums";

export interface ILoginUserPayload {
	email: string;
	password: string;
}

export interface IRegisterPatientPayload {
	name: string;
	email: string;
	password: string;
	patient: {
		contactNumber?: string;
	};
}

export interface IRequestUser {
	userId: string;
	email: string;
	name: string;
	role: Role;
}

export interface IGLogin {
	idToken: string;
}

export interface IForgetPassword {
	email: string;
}

export interface IResetPassword {
	email: string;
	newPassword: string;
	otp: string;
}
