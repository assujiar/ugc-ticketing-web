import { NextRequest, NextResponse } from "next/server";
import { sendSLAReminders } from "@/lib/email/notifications";

// Vercel Cron or manual trigger
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendSLAReminders();
    
    return NextResponse.json({
      success: true,
      message: "SLA reminders processed",
      remindersSent: result.remindersSent || 0,
    });
  } catch (error) {
    console.error("Cron SLA reminders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
