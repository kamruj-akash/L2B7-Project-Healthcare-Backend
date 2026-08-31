import PDFDocument from "pdfkit";
import { Resend } from "resend";
import config from "../config";

const resend = new Resend(config.resend_api);

export const sendRegistrationOtp = async (email: string, otp: string) => {
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

export const sendWelcomeEmail = async (email: string, name: string) => {
	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: email,
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
                Welcome aboard, ${name}
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

	return;
};

export const sendPasswordResetOtp = async (
	name: string,
	email: string,
	otp: string,
) => {
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
                Hi ${name}, we received a request to reset the password for your HealthCare account. Enter the code below to set a new one.
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

	return;
};

export const sendPasswordResetConfirmationEmail = async (
	name: string,
	email: string,
) => {
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
                Hi ${name}, the password for your HealthCare account was changed successfully. You can now sign in with your new password.
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
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#64748b;">Changed on</td>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${new Date().toLocaleDateString()}</td>
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

export const sendDoctorVerificationOtp = async (email: string, otp: string) => {
	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: email,
		subject: `${otp} is your HealthCare verification code`,
		html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Verify your HealthCare doctor account</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your verification code is ${otp}. It expires in 10 minutes.
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
                    &#9877;&nbsp; DOCTOR VERIFICATION
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 10px 0;font-size:20px;line-height:28px;color:#0f172a;font-weight:600;">
                Verify your email address
              </h1>
              <p style="margin:0 0 26px 0;font-size:15px;line-height:24px;color:#475569;">
                Enter the code below to finish verifying your HealthCare doctor account. This step keeps patient records safe by confirming you own this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px dashed #99f6e4;border-radius:10px;">
                <tr>
                  <td align="center" style="padding:24px 20px 18px 20px;">
                    <p style="margin:0 0 12px 0;font-size:12px;font-weight:600;letter-spacing:0.6px;color:#64748b;">
                      YOUR VERIFICATION CODE
                    </p>
                    <p style="margin:0;font-size:34px;line-height:40px;font-weight:700;color:#0f766e;letter-spacing:9px;font-family:'SF Mono',Consolas,Menlo,monospace;">
                      ${otp}
                    </p>
                    <p style="margin:14px 0 0 0;font-size:13px;line-height:20px;color:#94a3b8;">
                      Expires in 10 minutes
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#64748b;width:40%;">Account</td>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${email}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;line-height:20px;color:#64748b;">Requested on</td>
                        <td style="font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${new Date().toLocaleDateString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 30px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#fef2f2;border-left:3px solid #ef4444;border-radius:6px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;line-height:21px;color:#7f1d1d;">
                      <strong>Didn't request this?</strong> Someone may be trying to register with your email. Ignore this message and let us know at
                      <a href="mailto:support@healthcare.com" style="color:#b91c1c;font-weight:600;text-decoration:underline;">support@healthcare.com</a>.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0;font-size:13px;line-height:21px;color:#94a3b8;">
                HealthCare staff will never ask you for this code over phone, chat or email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:22px 32px 28px 32px;">
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
const escapeHtml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export const sendDoctorApprovalEmail = async (
	email: string,
	doctorName: string,
	dashboardUrl = "https://healthcare.com/doctor/dashboard",
) => {
	const name = escapeHtml(doctorName);

	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: email,
		subject: "Your HealthCare doctor account is approved",
		html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Your HealthCare doctor account is approved</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your doctor account has been approved. You can now start accepting appointments.
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
                  <td style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:#047857;letter-spacing:0.3px;">
                    &#10003;&nbsp; APPLICATION APPROVED
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 10px 0;font-size:20px;line-height:28px;color:#0f172a;font-weight:600;">
                Welcome aboard, Dr. ${name}
              </h1>
              <p style="margin:0 0 26px 0;font-size:15px;line-height:24px;color:#475569;">
                Our team has reviewed your credentials and your HealthCare doctor account is now verified. You can sign in and start seeing patients right away.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px dashed #a7f3d0;border-radius:10px;">
                <tr>
                  <td align="center" style="padding:24px 20px;">
                    <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:0.6px;color:#64748b;">
                      ACCOUNT STATUS
                    </p>
                    <p style="margin:0;font-size:22px;line-height:30px;font-weight:700;color:#047857;letter-spacing:-0.2px;">
                      Verified
                    </p>
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
                    <a href="${dashboardUrl}" style="display:inline-block;padding:13px 30px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Go to your dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#64748b;width:40%;">Account</td>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${email}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;line-height:20px;color:#64748b;">Approved on</td>
                        <td style="font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${new Date().toLocaleDateString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 30px 32px;">
              <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;letter-spacing:0.4px;color:#64748b;">
                NEXT STEPS
              </p>
              <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;color:#475569;">
                1.&nbsp; Complete your public profile &mdash; photo, bio and specialties.
              </p>
              <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;color:#475569;">
                2.&nbsp; Set your weekly availability so patients can book slots.
              </p>
              <p style="margin:0 0 20px 0;font-size:14px;line-height:22px;color:#475569;">
                3.&nbsp; Review your consultation fee before going live.
              </p>

              <p style="margin:0;font-size:13px;line-height:21px;color:#94a3b8;">
                Questions about your account? Reach us at
                <a href="mailto:support@healthcare.com" style="color:#0f766e;font-weight:600;text-decoration:underline;">support@healthcare.com</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:22px 32px 28px 32px;">
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

export const sendDoctorRejectionEmail = async (
	email: string,
	doctorName: string,
	rejectionReason: string,
) => {
	const name = escapeHtml(doctorName);
	const reason = escapeHtml(rejectionReason);

	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: email,
		subject: "Update on your HealthCare doctor application",
		html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Update on your HealthCare doctor application</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    We could not verify your doctor application. Details and next steps inside.
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
                  <td style="background-color:#fff7ed;border:1px solid #fed7aa;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:#c2410c;letter-spacing:0.3px;">
                    &#9888;&nbsp; APPLICATION UPDATE
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 10px 0;font-size:20px;line-height:28px;color:#0f172a;font-weight:600;">
                We couldn't verify your application
              </h1>
              <p style="margin:0 0 26px 0;font-size:15px;line-height:24px;color:#475569;">
                Hi Dr. ${name}, thank you for applying to HealthCare. After reviewing your submission, our verification team wasn't able to approve it in its current form.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#fef2f2;border-left:3px solid #ef4444;border-radius:6px;padding:16px 18px;">
                    <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:0.5px;color:#b91c1c;">
                      REASON FOR REJECTION
                    </p>
                    <p style="margin:0;font-size:14px;line-height:22px;color:#7f1d1d;">
                      ${reason}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#64748b;width:40%;">Account</td>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${email}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;line-height:20px;color:#64748b;">Reviewed on</td>
                        <td style="font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${new Date().toLocaleDateString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 30px 32px;">
              <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;letter-spacing:0.4px;color:#64748b;">
                WHAT YOU CAN DO NEXT
              </p>
              <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;color:#475569;">
                1.&nbsp; Read the reason above and gather the corrected documents.
              </p>
              <p style="margin:0 0 20px 0;font-size:14px;line-height:22px;color:#475569;">
                2.&nbsp; Reply to our support team with the updated files &mdash; we'll re-open your application.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#0f766e;border-radius:8px;">
                    <a href="mailto:support@healthcare.com" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Contact support
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0;font-size:13px;line-height:21px;color:#94a3b8;">
                If you believe this was a mistake, let us know and a reviewer will take another look.
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:22px 32px 28px 32px;">
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
type DecimalLike = { toFixed: (digits?: number) => string };

export type AppointmentInvoiceData = {
	patientName: string;
	doctorName: string;
	serialNumber: string | number;
	joiningTime: string | Date;
	amount: string | number | DecimalLike;
	status: string;
	bkashTrxId: string;
	paidAt: string | Date;
};

const TEAL = "#0d9488";
const DEEP_TEAL = "#0f766e";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

const fmt = (value: string | Date) =>
	value instanceof Date ? value.toLocaleString() : String(value);

export const generateAppointmentInvoicePdf = (
	data: AppointmentInvoiceData,
): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ size: "A4", margin: 50 });
			const chunks: Buffer[] = [];

			doc.on("data", (chunk: Buffer) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			const pageWidth = doc.page.width;
			const right = pageWidth - 50;
			const contentWidth = right - 50;

			// Header band
			doc.rect(0, 0, pageWidth, 96).fill(TEAL);
			doc
				.fillColor("#ffffff")
				.font("Helvetica-Bold")
				.fontSize(20)
				.text("+ HealthCare", 50, 32);
			doc
				.font("Helvetica")
				.fontSize(10)
				.fillColor("#d5f5f0")
				.text("Appointment Invoice", 50, 60);
			doc
				.font("Helvetica-Bold")
				.fontSize(12)
				.fillColor("#ffffff")
				.text(`INV-${data.serialNumber}`, 50, 34, {
					width: contentWidth,
					align: "right",
				});
			doc
				.font("Helvetica")
				.fontSize(9)
				.fillColor("#d5f5f0")
				.text(`Issued ${new Date().toLocaleDateString()}`, 50, 54, {
					width: contentWidth,
					align: "right",
				});

			// Billed to
			doc
				.font("Helvetica")
				.fontSize(9)
				.fillColor(MUTED)
				.text("BILLED TO", 50, 130, { characterSpacing: 0.8 });
			doc
				.font("Helvetica-Bold")
				.fontSize(14)
				.fillColor(INK)
				.text(data.patientName, 50, 146);

			// Payment status pill
			const statusText = data.status.toUpperCase();
			const pillWidth = doc.widthOfString(statusText) + 24;
			doc
				.roundedRect(right - pillWidth, 132, pillWidth, 24, 12)
				.fillAndStroke("#ecfdf5", "#a7f3d0");
			doc
				.font("Helvetica-Bold")
				.fontSize(9)
				.fillColor("#047857")
				.text(statusText, right - pillWidth, 140, {
					width: pillWidth,
					align: "center",
				});

			// Detail rows
			let y = 196;
			const row = (label: string, value: string) => {
				doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(label, 50, y);
				doc
					.font("Helvetica-Bold")
					.fontSize(10)
					.fillColor(INK)
					.text(value, 250, y, { width: right - 250, align: "right" });
				y += 20;
				doc
					.moveTo(50, y - 5)
					.lineTo(right, y - 5)
					.lineWidth(0.5)
					.strokeColor(LINE)
					.stroke();
				y += 8;
			};

			doc
				.font("Helvetica")
				.fontSize(9)
				.fillColor(MUTED)
				.text("APPOINTMENT DETAILS", 50, 176, { characterSpacing: 0.8 });

			row("Serial number", `#${data.serialNumber}`);
			row("Doctor", `Dr. ${data.doctorName}`);
			row("Joining time", fmt(data.joiningTime));
			row("Payment method", "bKash");
			row("Transaction ID", data.bkashTrxId);
			row("Paid at", fmt(data.paidAt));

			// Total box
			y += 12;
			doc
				.roundedRect(50, y, contentWidth, 66, 10)
				.fillAndStroke("#f0fdfa", "#99f6e4");
			doc
				.font("Helvetica")
				.fontSize(9)
				.fillColor(DEEP_TEAL)
				.text("AMOUNT PAID", 70, y + 18, { characterSpacing: 0.8 });
			doc
				.font("Helvetica-Bold")
				.fontSize(24)
				.fillColor(INK)
				.text(`BDT ${data.amount}`, 50, y + 30, {
					width: contentWidth - 20,
					align: "right",
				});

			// Footer
			doc
				.font("Helvetica")
				.fontSize(9)
				.fillColor(MUTED)
				.text(
					"This is a computer-generated invoice and does not require a signature. " +
						"For any billing question, write to support@healthcare.com.",
					50,
					y + 100,
					{ width: contentWidth },
				);

			doc.end();
		} catch (error) {
			reject(error);
		}
	});

export type AppointmentConfirmationPayload = {
	email: string;
	patientName: string;
	doctorName: string;
	meetingLink: string;
	joiningTime: string | Date;
	serialNumber: string | number;
	/** When provided, a PDF invoice is generated and attached to the email. */
	invoice?: AppointmentInvoiceData;
};

export const sendAppointmentConfirmationEmail = async ({
	email,
	patientName,
	doctorName,
	meetingLink,
	joiningTime,
	serialNumber,
	invoice,
}: AppointmentConfirmationPayload) => {
	const patient = escapeHtml(patientName);
	const doctor = escapeHtml(doctorName);
	const link = escapeHtml(meetingLink);
	const serial = escapeHtml(String(serialNumber));
	const time = escapeHtml(
		joiningTime instanceof Date ? joiningTime.toLocaleString() : joiningTime,
	);

	const attachments = invoice
		? [
				{
					filename: `healthcare-invoice-${invoice.serialNumber}.pdf`,
					content: await generateAppointmentInvoicePdf(invoice),
				},
			]
		: undefined;

	await resend.emails.send({
		from: "support@zaman.ami.bd",
		to: email,
		subject: `Appointment confirmed with Dr. ${doctorName} — Serial #${serialNumber}`,
		html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Your HealthCare appointment is confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Confirmed — Dr. ${doctor}, serial #${serial}, joining at ${time}.
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
                  <td style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:#047857;letter-spacing:0.3px;">
                    &#10003;&nbsp; APPOINTMENT CONFIRMED
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 10px 0;font-size:20px;line-height:28px;color:#0f172a;font-weight:600;">
                You're booked, ${patient}
              </h1>
              <p style="margin:0 0 26px 0;font-size:15px;line-height:24px;color:#475569;">
                Your appointment with Dr. ${doctor} is confirmed. Keep your serial number handy and join using the link below at your scheduled time.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;">
                <tr>
                  <td align="center" style="padding:22px 12px;">
                    <div style="font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#0f766e;margin-bottom:10px;">
                      Your Serial Number
                    </div>
                    <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:36px;font-weight:700;letter-spacing:4px;color:#0f172a;line-height:1;">
                      ${serial}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:10px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#64748b;width:40%;">Doctor</td>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">Dr. ${doctor}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#64748b;">Joining time</td>
                        <td style="padding-bottom:10px;font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${time}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;line-height:20px;color:#64748b;">Patient</td>
                        <td style="font-size:13px;line-height:20px;color:#0f172a;font-weight:600;" align="right">${patient}</td>
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
                    <a href="${link}"
                       style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Join consultation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0 0;font-size:12px;line-height:19px;color:#94a3b8;word-break:break-all;">
                Button not working? Use this link:<br />
                <a href="${link}" style="color:#0d9488;text-decoration:none;">${link}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 30px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#fefce8;border-left:3px solid #eab308;border-radius:6px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;line-height:21px;color:#713f12;">
                      Please join a few minutes early from a quiet place with a stable internet connection. Serials are called in order, so a short wait is normal.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0;font-size:13px;line-height:21px;color:#94a3b8;">
                This link is meant only for you — please don't share it with anyone else.
              </p>
              ${
								invoice
									? `<p style="margin:10px 0 0 0;font-size:13px;line-height:21px;color:#94a3b8;">
                Your payment invoice is attached to this email as a PDF.
              </p>`
									: ""
							}
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:22px 32px 28px 32px;">
              <p style="margin:0 0 6px 0;font-size:12px;line-height:19px;color:#94a3b8;">
                Questions? Reach us at
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
		attachments,
	});

	return;
};
