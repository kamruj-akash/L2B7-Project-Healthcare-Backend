import httpStatus from "http-status";
import cloudinary from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";

const uploadProfileImage = async (bufferImage: Buffer, email: string) => {
	const user = await prisma.user.findUnique({ where: { email } });
	if (user?.imagePublicId) {
		cloudinary.uploader.destroy(user.imagePublicId, { invalidate: true });
	}
	cloudinary.uploader
		.upload_stream(
			{
				resource_type: "auto",
			},
			async (error, result) => {
				if (error) {
					console.log(error);
					throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
				}

				const user = await prisma.user.findUnique({ where: { email } });
				if (user?.imagePublicId && result?.public_id) {
					await cloudinary.uploader.destroy(user.imagePublicId, {
						invalidate: true,
					});
				}

				await prisma.user.update({
					where: { email },
					data: {
						profileImage: result?.secure_url,
						imagePublicId: result?.public_id,
					},
				});
			},
		)
		.end(bufferImage);
};

export const userService = {
	uploadProfileImage,
};
