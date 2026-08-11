import { z } from "zod";

export const RegisterPatientZod = z.object({
	name: z.string("Not a String").min(3).max(255),
	email: z.string().email("invalid email"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(64, "Password must be at most 64 characters"),
	patient: z
		.object({
			contactNumber: z.string("Not a String").optional(),
			address: z.string("Not a String").optional(),
		})
		.optional(),
});
export const LoginPatientZod = z.object({
	email: z.string().email("invalid email"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(64, "Password must be at most 64 characters"),
});

export const GLoginZod = z.object({
	idToken: z.string(),
});
