import httpStatus from "http-status";
import config from "../config";
import { AppError } from "../utils/appError";
import { redisClient } from "./redis";

export const getBkashIdToken = async () => {
	try {
		const idTokenKey = "bkashAuth:IdToken";
		const refreshTokenKey = "bkashAuth:refreshToken";
		let idToken = await redisClient.get(idTokenKey);
		const idTokenExpire = await redisClient.ttl(idTokenKey);
		let refreshToken = await redisClient.get(refreshTokenKey);
		const refreshTOkenExpire = await redisClient.ttl(refreshTokenKey);

		if (refreshToken && idTokenExpire <= 600 && refreshTOkenExpire > 600) {
			const response = await fetch(
				`${config.bkash_url}/tokenized/checkout/token/grant`,
				{
					method: "POST",
					headers: {
						"content-type": "application/json",
						Accept: "application/json",
						username: config.bkash_user,
						password: config.bkash_pass,
					},
					body: JSON.stringify({
						app_key: config.bkash_app_key,
						app_secret: config.bkash_app_secret,
						refresh_token: refreshToken,
					}),
				},
			);
			const newToken = await response.json();
			idToken = newToken.id_token;
			await redisClient.set(idTokenKey, newToken.id_token, {
				expiration: {
					type: "EX",
					value: 60 * 60,
				},
			});
		}

		const response = await fetch(
			`${config.bkash_url}/tokenized/checkout/token/grant`,
			{
				method: "POST",
				headers: {
					"content-type": "application/json",
					Accept: "application/json",
					username: config.bkash_user,
					password: config.bkash_pass,
				},
				body: JSON.stringify({
					app_key: config.bkash_app_key,
					app_secret: config.bkash_app_secret,
				}),
			},
		);

		if (!response.ok) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Bkash Access Token Failed",
			);
		}
		const result = await response.json();
		idToken = result.id_token;
		refreshToken = result.refresh_token;

		await redisClient.set(idTokenKey, result.id_token, {
			expiration: {
				type: "EX",
				value: 60 * 60,
			},
		});

		await redisClient.set(refreshTokenKey, result.refresh_token, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 * 28,
			},
		});

		return idToken;
	} catch (error) {
		console.log(error);
		if (error instanceof AppError) throw error;
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Failed to get bKash ID Token",
		);
	}
};
