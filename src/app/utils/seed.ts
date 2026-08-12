import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
	try {
		const isSuperExist = await prisma.user.findFirst({
			where: {
				role: Role.SUPER_ADMIN,
			},
		});

		if (isSuperExist) {
			console.log(`Super Admin Already Exists, No need to Add once!!`);
			return;
		}

		const superAdminData = {
			name: "Super Admin",
			email: "superadmin@gmail.com",
			password: await bcrypt.hash(
				"SuperAdmin",
				Number(config.bcrypt_salt_rounds),
			),
			role: Role.SUPER_ADMIN,
			needPasswordChange: false,
			emailVerified: true,
		};

		const superAdmin = await prisma.user.create({
			data: superAdminData,
		});

		console.log(`super Admin created success! => ${superAdmin}`);
	} catch (error) {
		console.log(`error seeding superAdmin: => ${error}`);
	}
};
