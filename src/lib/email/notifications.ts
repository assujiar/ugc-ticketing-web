import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, sendBulkEmails, SendEmailParams } from "@/lib/email";
import {
  ticketCreatedForCreator,
  ticketCreatedForDepartment,
  ticketCreatedForManager,
  ticketResponseNotification,
  quoteSubmittedNotification,
  ticketClosedNotification,
  slaReminderNotification,
  TicketEmailData,
} from "@/lib/email/templates";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const MANAGER_ROLES = ["super_admin", "marketing_manager", "sales_manager"];

// ==================== TICKET CREATED ====================

export async function notifyTicketCreated(ticketId: string) {
  try {
    const supabase = createAdminClient();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`*, creator:users!tickets_created_by_fkey(id, email, full_name), departments(id, name, code)`)
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      console.error("[NOTIFY] Failed to fetch ticket:", error);
      return { success: false, error };
    }

    const ticketData = ticket as any;
    const ticketUrl = `${BASE_URL}/tickets/${ticketId}`;
    const metadata = ticketData.metadata || {};
    
    const emailData: TicketEmailData = {
      ticketCode: ticketData.ticket_code,
      ticketType: ticketData.ticket_type,
      subject: ticketData.subject,
      description: ticketData.description,
      priority: ticketData.priority,
      departmentName: ticketData.departments?.name || "Unknown",
      creatorName: ticketData.creator?.full_name || "Unknown",
      creatorEmail: ticketData.creator?.email || "",
      customerName: metadata.customer_name,
      serviceType: metadata.service_type,
      origin: metadata.origin,
      destination: metadata.destination,
      ticketUrl,
    };

    const emails: SendEmailParams[] = [];

    // 1. Email to Creator
    if (ticketData.creator?.email) {
      emails.push({
        to: ticketData.creator.email,
        subject: `[${ticketData.ticket_code}] Ticket Created - ${ticketData.subject}`,
        html: ticketCreatedForCreator(emailData),
      });
    }

    // 2. Email to Department Users
    const { data: deptUsers } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("department_id", ticketData.department_id)
      .eq("is_active", true);

    if (deptUsers?.length) {
      const deptEmails = deptUsers.map((u: any) => u.email).filter(Boolean);
      if (deptEmails.length > 0) {
        emails.push({
          to: deptEmails,
          subject: `[${ticketData.ticket_code}] New Ticket - ${ticketData.subject}`,
          html: ticketCreatedForDepartment(emailData),
        });
      }
    }

    // 3. Email to Managers
    const { data: managers } = await supabase
      .from("users")
      .select("email, full_name, roles!inner(name)")
      .in("roles.name", MANAGER_ROLES)
      .eq("is_active", true);

    if (managers?.length) {
      const managerEmails = (managers as any[]).map(m => m.email).filter(Boolean).filter((e: string) => e !== ticketData.creator?.email);
      if (managerEmails.length > 0) {
        emails.push({
          to: managerEmails,
          subject: `[${ticketData.ticket_code}] New Ticket Alert - ${ticketData.subject}`,
          html: ticketCreatedForManager(emailData),
        });
      }
    }

    const results = await sendBulkEmails(emails);
    console.log("[NOTIFY] Ticket created notifications sent:", results.length);
    return { success: true, emailsSent: results.length };
  } catch (error) {
    console.error("[NOTIFY] notifyTicketCreated error:", error);
    return { success: false, error };
  }
}

// ==================== TICKET RESPONSE ====================

export async function notifyTicketResponse(ticketId: string, responderId: string, responseContent?: string) {
  try {
    const supabase = createAdminClient();

    const { data: ticket } = await supabase
      .from("tickets")
      .select(`*, creator:users!tickets_created_by_fkey(id, email, full_name), departments(id, name)`)
      .eq("id", ticketId)
      .single();

    if (!ticket) return { success: false };

    const ticketData = ticket as any;

    const { data: responder } = await supabase
      .from("users")
      .select("full_name, email, department_id")
      .eq("id", responderId)
      .single();

    const ticketUrl = `${BASE_URL}/tickets/${ticketId}`;
    const emails: SendEmailParams[] = [];

    // If responder is NOT the creator -> notify creator
    if (responderId !== ticketData.created_by && ticketData.creator?.email) {
      emails.push({
        to: ticketData.creator.email,
        subject: `[${ticketData.ticket_code}] New Response - ${ticketData.subject}`,
        html: ticketResponseNotification({
          ticketCode: ticketData.ticket_code,
          subject: ticketData.subject,
          responderName: responder?.full_name || "Team member",
          responsePreview: responseContent,
          ticketUrl,
          recipientName: ticketData.creator.full_name,
        }),
      });
    }

    // If responder IS the creator -> notify department
    if (responderId === ticketData.created_by) {
      const { data: deptUsers } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("department_id", ticketData.department_id)
        .eq("is_active", true);

      if (deptUsers?.length) {
        const deptEmails = (deptUsers as any[]).map(u => u.email).filter(Boolean);
        if (deptEmails.length > 0) {
          emails.push({
            to: deptEmails,
            subject: `[${ticketData.ticket_code}] Customer Response - ${ticketData.subject}`,
            html: ticketResponseNotification({
              ticketCode: ticketData.ticket_code,
              subject: ticketData.subject,
              responderName: ticketData.creator?.full_name || "Customer",
              responsePreview: responseContent,
              ticketUrl,
              recipientName: ticketData.departments?.name || "Team",
            }),
          });
        }
      }
    }

    await sendBulkEmails(emails);
    return { success: true };
  } catch (error) {
    console.error("[NOTIFY] notifyTicketResponse error:", error);
    return { success: false, error };
  }
}

// ==================== QUOTE SUBMITTED ====================

export async function notifyQuoteSubmitted(ticketId: string, quoteData: { amount: number; currency: string; valid_until: string }) {
  try {
    const supabase = createAdminClient();

    const { data: ticket } = await supabase
      .from("tickets")
      .select(`*, creator:users!tickets_created_by_fkey(id, email, full_name)`)
      .eq("id", ticketId)
      .single();

    const ticketData = ticket as any;
    if (!ticketData?.creator?.email) return { success: false };

    const ticketUrl = `${BASE_URL}/tickets/${ticketId}`;

    await sendEmail({
      to: ticketData.creator.email,
      subject: `[${ticketData.ticket_code}] Quote Submitted - ${ticketData.subject}`,
      html: quoteSubmittedNotification({
        ticketCode: ticketData.ticket_code,
        subject: ticketData.subject,
        amount: quoteData.amount,
        currency: quoteData.currency,
        validUntil: quoteData.valid_until,
        ticketUrl,
        recipientName: ticketData.creator.full_name,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error("[NOTIFY] notifyQuoteSubmitted error:", error);
    return { success: false, error };
  }
}

// ==================== TICKET CLOSED ====================

export async function notifyTicketClosed(ticketId: string, outcome: "won" | "lost" | "resolved") {
  try {
    const supabase = createAdminClient();

    const { data: ticket } = await supabase
      .from("tickets")
      .select(`*, creator:users!tickets_created_by_fkey(id, email, full_name), departments(id, name)`)
      .eq("id", ticketId)
      .single();

    if (!ticket) return { success: false };

    const ticketData = ticket as any;
    const ticketUrl = `${BASE_URL}/tickets/${ticketId}`;
    const emails: SendEmailParams[] = [];

    // Notify creator
    if (ticketData.creator?.email) {
      emails.push({
        to: ticketData.creator.email,
        subject: `[${ticketData.ticket_code}] Ticket Closed - ${outcome.toUpperCase()}`,
        html: ticketClosedNotification({
          ticketCode: ticketData.ticket_code,
          subject: ticketData.subject,
          outcome,
          ticketUrl,
          recipientName: ticketData.creator.full_name,
        }),
      });
    }

    // Notify department
    const { data: deptUsers } = await supabase
      .from("users")
      .select("email")
      .eq("department_id", ticketData.department_id)
      .eq("is_active", true);

    if (deptUsers?.length) {
      const deptEmails = (deptUsers as any[]).map(u => u.email).filter(Boolean);
      if (deptEmails.length > 0) {
        emails.push({
          to: deptEmails,
          subject: `[${ticketData.ticket_code}] Ticket Closed - ${outcome.toUpperCase()}`,
          html: ticketClosedNotification({
            ticketCode: ticketData.ticket_code,
            subject: ticketData.subject,
            outcome,
            ticketUrl,
            recipientName: ticketData.departments?.name || "Team",
          }),
        });
      }
    }

    await sendBulkEmails(emails);
    return { success: true };
  } catch (error) {
    console.error("[NOTIFY] notifyTicketClosed error:", error);
    return { success: false, error };
  }
}

// ==================== SLA REMINDER ====================

export async function sendSLAReminders() {
  try {
    const supabase = createAdminClient();
    const now = new Date();

    // SLA intervals in hours
    const SLA_INTERVALS = [2, 4, 6, 9, 12, 24, 36, 48, 60, 72];

    // Fetch open tickets with last activity
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select(`*, creator:users!tickets_created_by_fkey(id, email, full_name), departments(id, name, code)`)
      .not("status", "eq", "closed")
      .order("updated_at", { ascending: true });

    if (error || !tickets) {
      console.error("[SLA] Failed to fetch tickets:", error);
      return { success: false, error };
    }

    let remindersSent = 0;

    for (const ticket of tickets) {
      const ticketData = ticket as any;
      const lastActivity = new Date(ticketData.updated_at);
      const hoursElapsed = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));

      // Check if we should send a reminder at this interval
      const matchingInterval = SLA_INTERVALS.find(interval => {
        return hoursElapsed >= interval && hoursElapsed < interval + 1;
      });

      if (!matchingInterval) continue;

      // Determine escalation level
      let escalationLevel: "warning" | "critical" | "severe" = "warning";
      if (hoursElapsed >= 24) escalationLevel = "critical";
      if (hoursElapsed >= 48) escalationLevel = "severe";

      const ticketUrl = `${BASE_URL}/tickets/${ticketData.id}`;

      // Get department users
      const { data: deptUsers } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("department_id", ticketData.department_id)
        .eq("is_active", true);

      const emails: SendEmailParams[] = [];

      if (deptUsers?.length) {
        for (const user of deptUsers) {
          const userData = user as any;
          if (!userData.email) continue;
          
          emails.push({
            to: userData.email,
            subject: `[SLA ${escalationLevel.toUpperCase()}] [${ticketData.ticket_code}] ${hoursElapsed}h without response`,
            html: slaReminderNotification({
              ticketCode: ticketData.ticket_code,
              subject: ticketData.subject,
              hoursOverdue: hoursElapsed,
              priority: ticketData.priority,
              departmentName: ticketData.departments?.name || "Unknown",
              creatorName: ticketData.creator?.full_name || "Unknown",
              lastResponseAt: lastActivity.toLocaleString("id-ID"),
              ticketUrl,
              recipientName: userData.full_name,
              escalationLevel,
            }),
          });
        }
      }

      // Also notify managers for critical/severe
      if (escalationLevel !== "warning") {
        const { data: managers } = await supabase
          .from("users")
          .select("email, full_name, roles!inner(name)")
          .in("roles.name", MANAGER_ROLES)
          .eq("is_active", true);

        if (managers?.length) {
          for (const manager of managers) {
            const managerData = manager as any;
            if (!managerData.email) continue;
            
            emails.push({
              to: managerData.email,
              subject: `[SLA ${escalationLevel.toUpperCase()}] [${ticketData.ticket_code}] ${hoursElapsed}h without response`,
              html: slaReminderNotification({
                ticketCode: ticketData.ticket_code,
                subject: ticketData.subject,
                hoursOverdue: hoursElapsed,
                priority: ticketData.priority,
                departmentName: ticketData.departments?.name || "Unknown",
                creatorName: ticketData.creator?.full_name || "Unknown",
                lastResponseAt: lastActivity.toLocaleString("id-ID"),
                ticketUrl,
                recipientName: managerData.full_name,
                escalationLevel,
              }),
            });
          }
        }
      }

      if (emails.length > 0) {
        await sendBulkEmails(emails);
        remindersSent += emails.length;
      }
    }

    console.log("[SLA] Reminders sent:", remindersSent);
    return { success: true, remindersSent };
  } catch (error) {
    console.error("[SLA] sendSLAReminders error:", error);
    return { success: false, error };
  }
}
