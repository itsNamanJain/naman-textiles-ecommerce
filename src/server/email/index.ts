import nodemailer from "nodemailer";
import { env } from "@/env";

const isEmailConfigured = !!(
  env.SMTP_HOST &&
  env.SMTP_PORT &&
  env.SMTP_USER &&
  env.SMTP_PASSWORD
);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    })
  : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!transporter) {
    console.log(
      `[Email] Skipping email (SMTP not configured): "${subject}" to ${to}`
    );
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME ?? "Naman Textiles"}" <${env.SMTP_FROM_EMAIL ?? env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent: "${subject}" to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, error);
    return false;
  }
}
