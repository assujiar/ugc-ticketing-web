import { NextRequest, NextResponse } from "next/server";
import { sendEmail, testSMTPConnection } from "@/lib/email";
import { requireAuth, isSuperAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    
    if (!isSuperAdmin(authResult.profile)) {
      return NextResponse.json({ error: "Super admin only" }, { status: 403 });
    }

    // Test SMTP connection
    const connectionTest = await testSMTPConnection();
    
    return NextResponse.json({
      success: true,
      smtp: {
        host: process.env.SMTP_HOST || "not configured",
        port: process.env.SMTP_PORT || "587",
        user: process.env.SMTP_USER ? "configured" : "not configured",
        connectionTest,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    
    if (!isSuperAdmin(authResult.profile)) {
      return NextResponse.json({ error: "Super admin only" }, { status: 403 });
    }

    const { to } = await request.json();
    
    if (!to) {
      return NextResponse.json({ error: "Email 'to' is required" }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject: "UGC Ticketing - Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #f97316;">🎉 Test Email Berhasil!</h2>
          <p>Email ini dikirim dari UGC Ticketing System.</p>
          <p>SMTP configuration is working correctly.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString("id-ID")}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
