import nodemailer from "nodemailer";

// Gmail SMTP settings are fixed/public — no need to put in .env
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;
const SMTP_SECURE = true; // port 465 always uses SSL

// Only credentials are secret — kept in .env
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const defaultFrom = `Book Store <${user}>`;

export function getTransporter() {
  if (!user || !pass) {
    console.warn("[mailer] SMTP credentials (SMTP_USER / SMTP_PASS) not configured.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user,
      pass,
    },
  });
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendMail({ to, subject, html, text, from = defaultFrom }: SendMailOptions) {
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: text || html.replace(/<[^>]+>/g, ""),
    html,
  });

  console.log(`[mailer] Email sent to ${to} (MessageId: ${info.messageId})`);
  return info;
}

/**
 * Sends a 6-digit OTP email for password reset.
 */
export async function sendOtpEmail(to: string, otp: string) {
  const subject = "Your Password Reset Code — Book Store";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e8e4df; padding: 40px 32px; text-align: center;">
          <!-- Brand Logo / Header -->
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #a9835a; font-weight: 600;">
                Book Store • Admin
              </p>
              <h1 style="margin: 16px 0 0 0; font-size: 24px; font-weight: 400; font-family: Georgia, serif; letter-spacing: -0.01em;">
                Password Reset Verification
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 24px 0;">
              <hr style="border: none; border-top: 1px solid #f0ece7; margin: 0;">
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td align="left" style="font-size: 14px; line-height: 1.6; color: #555555;">
              <p style="margin: 0 0 16px 0;">
                We received a request to reset the password for your Book Store administration account (<strong>${to}</strong>).
              </p>
              <p style="margin: 0 0 24px 0;">
                Please enter the following 6-digit verification code to complete your password reset:
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding: 10px 0 30px 0;">
              <div style="display: inline-block; background-color: #fcfbf9; border: 1.5px solid #a9835a; padding: 16px 36px; border-radius: 4px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.25em; color: #1a1a1a; font-family: monospace;">
                  ${otp}
                </span>
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td align="left" style="font-size: 12px; line-height: 1.5; color: #777777; background-color: #faf9f7; padding: 14px 18px; border-left: 3px solid #a9835a;">
              <p style="margin: 0;">
                <strong>Security Notice:</strong> This code is strictly confidential and will expire in <strong>5 minutes</strong>. If you did not request this password reset, please ignore this email or contact security immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 36px; font-size: 11px; color: #999999; text-align: center; border-top: 1px solid #f0ece7; margin-top: 30px;">
              <p style="margin: 16px 0 4px 0;">12 Place Vendôme, 75001 Paris • France</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Book Store. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendMail({
    to,
    subject,
    html,
    text: `Your Book Store password reset verification code is: ${otp}\n\nThis code will expire in 5 minutes. If you did not request this, please ignore this message.`,
  });
}

/**
 * Sends a 6-digit OTP email for admin login verification (2FA).
 */
export async function sendLoginOtpEmail(to: string, otp: string) {
  const subject = "Your Login Verification Code — Book Store";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e8e4df; padding: 40px 32px; text-align: center;">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #a9835a; font-weight: 600;">
                Book Store • Admin Access
              </p>
              <h1 style="margin: 16px 0 0 0; font-size: 24px; font-weight: 400; font-family: Georgia, serif; letter-spacing: -0.01em;">
                Login Verification
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 0;">
              <hr style="border: none; border-top: 1px solid #f0ece7; margin: 0;">
            </td>
          </tr>

          <tr>
            <td align="left" style="font-size: 14px; line-height: 1.6; color: #555555;">
              <p style="margin: 0 0 16px 0;">
                A login attempt was made for your Book Store admin account (<strong>${to}</strong>).
              </p>
              <p style="margin: 0 0 24px 0;">
                Enter the following 6-digit code to complete your sign-in:
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding: 10px 0 30px 0;">
              <div style="display: inline-block; background-color: #fcfbf9; border: 1.5px solid #a9835a; padding: 16px 36px; border-radius: 4px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.25em; color: #1a1a1a; font-family: monospace;">
                  ${otp}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td align="left" style="font-size: 12px; line-height: 1.5; color: #777777; background-color: #faf9f7; padding: 14px 18px; border-left: 3px solid #a9835a;">
              <p style="margin: 0;">
                <strong>Security Notice:</strong> This code expires in <strong>5 minutes</strong>. If you did not attempt to log in, please reset your password immediately.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-top: 36px; font-size: 11px; color: #999999; text-align: center; border-top: 1px solid #f0ece7; margin-top: 30px;">
              <p style="margin: 16px 0 4px 0;">12 Place Vendôme, 75001 Paris • France</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Book Store. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendMail({
    to,
    subject,
    html,
    text: `Your Book Store login verification code is: ${otp}\n\nThis code will expire in 5 minutes. If you did not attempt to log in, please reset your password immediately.`,
  });
}

/**
 * Sends a confirmation email after a password has been successfully reset.
 */
export async function sendPasswordResetSuccessEmail(to: string) {
  const subject = "Security Notice: Password Reset Successful — Book Store";
  const now = new Date().toUTCString();
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e8e4df; padding: 40px 32px; text-align: center;">
          <!-- Brand Logo / Header -->
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #a9835a; font-weight: 600;">
                Book Store • Security
              </p>
              <h1 style="margin: 16px 0 0 0; font-size: 24px; font-weight: 400; font-family: Georgia, serif; letter-spacing: -0.01em;">
                Password Successfully Reset
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 24px 0;">
              <hr style="border: none; border-top: 1px solid #f0ece7; margin: 0;">
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td align="left" style="font-size: 14px; line-height: 1.6; color: #555555;">
              <p style="margin: 0 0 16px 0;">
                This email confirms that the password for your Book Store administration account (<strong>${to}</strong>) was changed on <strong>${now}</strong>.
              </p>
              <p style="margin: 0 0 16px 0;">
                You can now log in using your new credentials.
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td align="left" style="font-size: 12px; line-height: 1.5; color: #b91c1c; background-color: #fef2f2; padding: 14px 18px; border-left: 3px solid #dc2626; margin-top: 20px;">
              <p style="margin: 0;">
                <strong>Did not make this change?</strong> If you did not authorize this action, please reset your password immediately and notify the administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 36px; font-size: 11px; color: #999999; text-align: center; border-top: 1px solid #f0ece7; margin-top: 30px;">
              <p style="margin: 16px 0 4px 0;">12 Place Vendôme, 75001 Paris • France</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Book Store. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendMail({
    to,
    subject,
    html,
    text: `Your Book Store password has been successfully reset on ${now}.\n\nIf you did not make this change, please reset your password immediately.`,
  });
}
