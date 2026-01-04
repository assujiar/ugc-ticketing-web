import nodemailer from "nodemailer";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Create SMTP transporter
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true"; // true for 465, false for other ports

  if (!host) {
    console.log("[EMAIL] SMTP not configured");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      // Allow self-signed certificates for internal SMTP
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
    },
  });
}

const FROM_EMAIL = process.env.EMAIL_FROM || "UGC Ticketing <noreply@ugc.co.id>";

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log("[EMAIL SKIP] SMTP not configured");
      console.log("Would send to:", to, "Subject:", subject);
      return { success: true, skipped: true };
    }

    const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
    if (recipients.length === 0) {
      console.log("[EMAIL SKIP] No recipients");
      return { success: true, skipped: true };
    }

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: recipients.join(", "),
      subject,
      html,
      text: text || subject,
    });

    console.log("[EMAIL SENT]", { 
      to: recipients, 
      subject, 
      messageId: info.messageId,
      response: info.response 
    });
    
    return { success: true, data: { messageId: info.messageId } };
  } catch (error) {
    console.error("[EMAIL ERROR]", error);
    return { success: false, error };
  }
}

export async function sendBulkEmails(emails: SendEmailParams[]) {
  const results = await Promise.allSettled(emails.map(email => sendEmail(email)));
  return results;
}

// Test SMTP connection
export async function testSMTPConnection() {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: "SMTP not configured" };
    }
    
    await transporter.verify();
    console.log("[SMTP] Connection verified successfully");
    return { success: true };
  } catch (error) {
    console.error("[SMTP] Connection failed:", error);
    return { success: false, error };
  }
}
