import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { redisClient } from "./app/lib/redis";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);

app.get("/redis", async (req: Request, res: Response) => {
	const OTP = crypto.randomInt(100000, 999999);
	await redisClient.set("forget-password-OTP:akash@gmail.com", "1234", {
		expiration: {
			type: "EX",
			value: 60,
		},
	});

	res.send({ message: "Redis is working", OTP });
});

// Basic route
app.get("/", async (_req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to PH Healthcare System Backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
