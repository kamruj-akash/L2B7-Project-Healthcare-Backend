import { UploadApiResponse } from "cloudinary";
import httpStatus from "http-status";
import cloudinary from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";

const uploadProfileImage = async (bufferImage: Buffer, email: string) => {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	const uploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					(error, result) => {
						if (error) {
							return reject(
								new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message),
							);
						}

						if (!result) {
							return reject(
								new AppError(
									httpStatus.INTERNAL_SERVER_ERROR,
									"No result returned from Cloudinary",
								),
							);
						}

						resolve(result);
					},
				)
				.end(bufferImage);
		},
	);

	await prisma.user.update({
		where: { email },
		data: {
			profileImage: uploadResult.secure_url,
			imagePublicId: uploadResult.public_id,
		},
	});

	if (user.imagePublicId) {
		await cloudinary.uploader.destroy(user.imagePublicId, {
			invalidate: true,
		});
	}
};

export const userService = {
	uploadProfileImage,
};
