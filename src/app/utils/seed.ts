import bcrypt from "bcryptjs";
import {
	DoctorVerificationStatus,
	Role,
	UserStatus,
} from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";

export const seedSuperAdminAndDoctor = async () => {
	try {
		const isSuperExist = await prisma.user.findFirst({
			where: {
				role: Role.SUPER_ADMIN,
			},
		});
		const isDoctorExist = await prisma.user.findFirst({
			where: {
				role: Role.DOCTOR,
			},
		});

		if (!isSuperExist) {
			const superAdmin = await prisma.user.create({
				data: {
					name: "Super Admin",
					email: "superadmin@gmail.com",
					password: await bcrypt.hash(
						"Admin123",
						Number(config.bcrypt_salt_rounds),
					),
					role: Role.SUPER_ADMIN,
					needPasswordChange: false,
					emailVerified: true,
				},
			});
			console.log(`super Admin created success!`);
		}

		if (!isDoctorExist) {
			const doctor = await prisma.user.create({
				data: {
					name: "Dr. John Doe",
					email: "doctor@gmail.com",
					password: await bcrypt.hash(
						"Doctor123",
						Number(config.bcrypt_salt_rounds),
					),
					role: Role.DOCTOR,
					needPasswordChange: false,
					emailVerified: true,
					status: UserStatus.ACTIVE,

					doctor: {
						create: {
							name: "Dr. John Doe",
							email: "doctor@gmail.com",
							licenseNumber: "DOC123456",
							specialization: "General Medicine",
							verificationStatus: DoctorVerificationStatus.APPROVE,
							reviewedBy: "SuperAdmin",
							reviewedAt: new Date(),
							bio: "Experienced doctor with a passion for patient care.",
							consultationFee: 1000,
							expYear: 10,
						},
					},
				},
			});

			console.log(`doctor created success!`);
		}
		return;
	} catch (error) {
		console.log(`error seeding superAdmin: => ${error}`);
	}
};
