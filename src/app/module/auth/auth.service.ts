import bcrypt from "bcryptjs";
import crypto from "crypto";
import { TokenPayload } from "google-auth-library";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { Resend } from "resend";
import {
	AuthProvider,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { googleClient } from "../../lib/googleClient";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import { jwtUtils } from "../../utils/jwt";
import {
	IForgetPassword,
	IGLogin,
	ILoginUserPayload,
	IRegisterPatientPayload,
	IRequestUser,
	IResetPassword,
} from "./auth.interface";

const resend = new Resend(config.resend_api);

const registerPatient = async (payload: IRegisterPatientPayload) => {
	const { name, password } = payload;
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const newUserData = {
		name,
		password: await bcrypt.hash(password, 8),
		email,
		role: Role.PATIENT,
	};

	const otp = crypto.randomInt(100000, 999999).toString();
	const otpKey = `UserRegistration-OTP:${email}`;
	const userKey = `UserRegistration:${email}`;

	await Promise.all([
		redisClient.set(otpKey, otp, {
			expiration: { type: "EX", value: 60 * 10 },
		}),
		redisClient.set(userKey, JSON.stringify(newUserData), {
			expiration: { type: "EX", value: 60 * 10 },
		}),
	]);

	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: email,
		replyTo: "support@zaman.ami.bd",
		subject: "Your OTP for PH Healthcare Registration",
		html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>HealthCare Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your HealthCare verification code is ${otp}. Valid for 10 minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">

          <tr>
            <td style="background-color:#0d9488;padding:26px 32px;" align="left">
              <span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:-0.2px;">
                &#43;&nbsp; HealthCare
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 32px 28px 32px;">
              <h1 style="margin:0 0 10px 0;font-size:20px;line-height:28px;color:#0f172a;font-weight:600;">
                Verify your identity
              </h1>
              <p style="margin:0 0 26px 0;font-size:15px;line-height:24px;color:#475569;">
                Hi there, use the code below to continue securely signing in to your HealthCare account.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:22px 12px;">
                    <div style="font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#0f766e;margin-bottom:10px;">
                      Verification Code
                    </div>
                    <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:36px;font-weight:700;letter-spacing:9px;color:#0f172a;line-height:1;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0 0;font-size:14px;line-height:22px;color:#64748b;">
                This code expires in <strong style="color:#0f172a;">10 minutes</strong>. Please don't share it with anyone — not even HealthCare staff.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;">
                <tr>
                  <td style="background-color:#fefce8;border-left:3px solid #eab308;border-radius:6px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;line-height:21px;color:#713f12;">
                      Didn't request this? Someone may have entered your email by mistake. You can safely ignore this message — no changes will be made to your account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:22px 32px 28px 32px;">
              <p style="margin:0 0 6px 0;font-size:12px;line-height:19px;color:#94a3b8;">
                Need help? Reach us at
                <a href="mailto:support@healthcare.com" style="color:#0d9488;text-decoration:none;">support@healthcare.com</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:19px;color:#94a3b8;">
                &copy; 2026 HealthCare. This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
	});

	return;
};

const verifyEmail = async (payload: { email: string; otp: string }) => {
	const { email, otp } = payload;
	const otpKey = `UserRegistration-OTP:${email}`;
	const userKey = `UserRegistration:${email}`;
	const redisOtp = await redisClient.get(otpKey);
	const userData = await redisClient.get(userKey);
	if (!userData || !redisOtp) {
		throw new Error("User data not found, please register again!");
	}
	if (redisOtp !== otp) {
		throw new Error("Invalid OTP");
	}
	const { name, password } = JSON.parse(userData);

	const user = await prisma.user.create({
		data: {
			name,
			email,
			role: Role.PATIENT,
			password,
			status: UserStatus.ACTIVE,
			emailVerified: true,
			patient: {
				create: { name, email },
			},
		},
		omit: { password: true },
		include: { patient: true },
	});

	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: user.email,
		subject: "Welcome to HealthCare",
		html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Welcome to HealthCare</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your email is verified — your HealthCare account is ready to use.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">

          <tr>
            <td style="background-color:#0d9488;padding:26px 32px;" align="left">
              <span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:-0.2px;">
                &#43;&nbsp; HealthCare
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:#0f766e;letter-spacing:0.3px;">
                    &#10003;&nbsp; EMAIL VERIFIED
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 10px 0;font-size:22px;line-height:30px;color:#0f172a;font-weight:600;">
                Welcome aboard, ${user.name}
              </h1>
              <p style="margin:0 0 28px 0;font-size:15px;line-height:24px;color:#475569;">
                Your account is verified and ready. HealthCare keeps your appointments, prescriptions and medical records in one secure place — accessible whenever you need them.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;">
                <tr>
                  <td style="padding:22px 22px 8px 22px;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#0f766e;">
                    Get started
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 22px 22px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" width="26" style="font-size:15px;line-height:23px;color:#0d9488;font-weight:700;">1.</td>
                        <td style="padding-bottom:12px;font-size:14px;line-height:22px;color:#334155;">
                          <strong style="color:#0f172a;">Complete your health profile</strong> — allergies, conditions and medications help your doctor advise you better.
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" width="26" style="font-size:15px;line-height:23px;color:#0d9488;font-weight:700;">2.</td>
                        <td style="padding-bottom:12px;font-size:14px;line-height:22px;color:#334155;">
                          <strong style="color:#0f172a;">Book your first appointment</strong> — browse doctors by specialty and pick a slot that suits you.
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" width="26" style="font-size:15px;line-height:23px;color:#0d9488;font-weight:700;">3.</td>
                        <td style="font-size:14px;line-height:22px;color:#334155;">
                          <strong style="color:#0f172a;">Turn on reminders</strong> — never miss a visit, refill or follow-up.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 32px 4px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#0d9488;border-radius:8px;">
                    <a href="https://yourdomain.com/dashboard"
                       style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Go to my dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 30px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#f0fdfa;border-left:3px solid #14b8a6;border-radius:6px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;line-height:21px;color:#134e4a;">
                      <strong>Your privacy matters.</strong> Your medical information is encrypted and only shared with the care providers you choose.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:22px 32px 28px 32px;">
              <p style="margin:0 0 6px 0;font-size:12px;line-height:19px;color:#94a3b8;">
                Questions? Write to
                <a href="mailto:support@healthcare.com" style="color:#0d9488;text-decoration:none;">support@healthcare.com</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:19px;color:#94a3b8;">
                &copy; 2026 HealthCare. You're receiving this because you created an account with us.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
	});

	await redisClient.del([otpKey, userKey]);

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return { accessToken, refreshToken };
};

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	console.log(payload);
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted");
	}

	if (user.password === null && user.googleId !== null) {
		throw new Error("Please login with google, set password!");
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
		include: {
			patient: true,
		},
		omit: {
			password: true,
		},
	});

	if (!isUserExists) {
		throw new Error("User not found");
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const googleLogin = async (payload: IGLogin) => {
	let googleIdTokenPayload: TokenPayload | undefined;

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.gClient_id,
		});
		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		throw new Error("Invalid or expired Google Id Token!", { cause: error });
	}

	if (!googleIdTokenPayload?.email || !googleIdTokenPayload.email_verified) {
		throw new Error("Google account email is missing or not verified!");
	}

	const { name, email, sub: googleId } = googleIdTokenPayload;

	let patient = await prisma.user.findFirst({
		where: { email, role: Role.PATIENT },
	});

	if (!patient) {
		patient = await prisma.user.create({
			data: {
				name: name ?? email.split("@")[0],
				email,
				googleId,
				role: Role.PATIENT,
				authProvider: AuthProvider.GOOGLE,
				emailVerified: true,
				patient: {
					create: {
						name: name ?? email.split("@")[0],
						email: email,
					},
				},
			},
		});
	}

	const jwtPayload = {
		userId: patient.id,
		name: patient.name,
		email: patient.email,
		role: patient.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return { accessToken, refreshToken };
};

export const forgetPassword = async (payload: IForgetPassword) => {
	const { email } = payload;
	const isUserExists = await prisma.user.findUniqueOrThrow({
		where: {
			email,
			status: UserStatus.ACTIVE,
		},
	});

	if (!isUserExists) {
		throw new Error("User is not exist or Blocked!");
	}

	if (
		isUserExists.authProvider !== AuthProvider.CREDENTIAL &&
		!isUserExists.password
	) {
		throw new Error("Please Login with Google!");
	}

	const otp = crypto.randomInt(100000, 999999).toString();
	const otpKey = `ForgetPassword-OTP:${email}`;

	await redisClient.set(otpKey, otp, {
		expiration: {
			type: "EX",
			value: 60 * 5,
		},
	});

	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: email,
		subject: "Your OTP for PH Healthcare Password Reset",
		html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Reset your HealthCare password</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Password reset code: ${otp} — valid for 10 minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">

          <tr>
            <td style="background-color:#0d9488;padding:26px 32px;" align="left">
              <span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:-0.2px;">
                &#43;&nbsp; HealthCare
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 32px 28px 32px;">
              <h1 style="margin:0 0 10px 0;font-size:20px;line-height:28px;color:#0f172a;font-weight:600;">
                Reset your password
              </h1>
              <p style="margin:0 0 26px 0;font-size:15px;line-height:24px;color:#475569;">
                Hi ${isUserExists.name}, we received a request to reset the password for your HealthCare account. Enter the code below to set a new one.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:22px 12px;">
                    <div style="font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#0f766e;margin-bottom:10px;">
                      Password Reset Code
                    </div>
                    <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:36px;font-weight:700;letter-spacing:9px;color:#0f172a;line-height:1;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0 0;font-size:14px;line-height:22px;color:#64748b;">
                This code expires in <strong style="color:#0f172a;">10 minutes</strong> and can be used only once. Your current password stays active until you finish the reset.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;">
                <tr>
                  <td style="background-color:#fef2f2;border-left:3px solid #ef4444;border-radius:6px;padding:14px 16px;">
                    <p style="margin:0 0 8px 0;font-size:13px;line-height:21px;color:#7f1d1d;">
                      <strong>Didn't request a reset?</strong> Ignore this email and your password will remain unchanged.
                    </p>
                    <p style="margin:0;font-size:13px;line-height:21px;color:#7f1d1d;">
                      If you keep receiving these, contact us right away — your medical records may be at risk.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;font-size:13px;line-height:21px;color:#94a3b8;">
                HealthCare will never call, text or email you asking for this code. Never share it with anyone, including our support team.
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:22px 32px 28px 32px;">
              <p style="margin:0 0 6px 0;font-size:12px;line-height:19px;color:#94a3b8;">
                Need help? Reach us at
                <a href="mailto:support@healthcare.com" style="color:#0d9488;text-decoration:none;">support@healthcare.com</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:19px;color:#94a3b8;">
                &copy; 2026 HealthCare. This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
	});
};

export const resetPassword = async (payload: IResetPassword) => {
	const { email, newPassword, otp } = payload;
	const otpKey = `ForgetPassword-OTP:${email}`;
	const redisOtp = await redisClient.get(otpKey);
	if (!redisOtp) {
		throw new Error("OTP is expired or invalid!");
	}

	if (redisOtp !== otp) {
		throw new Error("Otp is incorrect!");
	}

	const hashedPassword = await bcrypt.hash(
		newPassword,
		Number(config.bcrypt_salt_rounds),
	);

	const updatedUser = await prisma.user.update({
		where: {
			email,
		},
		data: {
			password: hashedPassword,
		},
	});

	await redisClient.del([otpKey]);

	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: email,
		subject: "Your HealthCare password has been reset successfully",
		html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Your HealthCare password was reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your HealthCare password was changed. If this wasn't you, act now.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">

          <tr>
            <td style="background-color:#0d9488;padding:26px 32px;" align="left">
              <span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:-0.2px;">
                &#43;&nbsp; HealthCare
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:#0f766e;letter-spacing:0.3px;">
                    &#10003;&nbsp; PASSWORD UPDATED
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 10px 0;font-size:20px;line-height:28px;color:#0f172a;font-weight:600;">
                Your password has been reset
              </h1>
              <p style="margin:0 0 26px 0;font-size:15px;line-height:24px;color:#475569;">
                Hi ${updatedUser.name}, the password for your HealthCare account was changed successfully. You can now sign in with your new password.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#64748b;width:40%;">Account</td>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${updatedUser.email}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#64748b;">Changed on</td>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${updatedUser.updatedAt}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:26px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#0d9488;border-radius:8px;">
                    <a href="https://yourdomain.com/login"
                       style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Sign in to my account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 30px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#fef2f2;border-left:3px solid #ef4444;border-radius:6px;padding:14px 16px;">
                    <p style="margin:0 0 8px 0;font-size:13px;line-height:21px;color:#7f1d1d;">
                      <strong>Wasn't you?</strong> Someone else may have access to your account and your medical records.
                    </p>
                    <p style="margin:0;font-size:13px;line-height:21px;color:#7f1d1d;">
                      Contact us immediately at
                      <a href="mailto:support@healthcare.com" style="color:#b91c1c;font-weight:600;text-decoration:underline;">support@healthcare.com</a>
                      so we can secure your account.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0;font-size:13px;line-height:21px;color:#94a3b8;">
                For your security, you've been signed out of all other devices.
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:22px 32px 28px 32px;">
              <p style="margin:0;font-size:12px;line-height:19px;color:#94a3b8;">
                &copy; 2026 HealthCare. This is an automated security notification, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
	});

	return;
};

export const AuthService = {
	registerPatient,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	forgetPassword,
	resetPassword,
	verifyEmail,
};
