import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import type { CreateTicketRequest } from "@/types/api";
import type { Json } from "@/types/database";

const ALLOWED_STATUSES = ["open", "in_progress", "pending", "resolved", "closed"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];
const isAllowedStatus = (v: string): v is AllowedStatus =>
  (ALLOWED_STATUSES as readonly string[]).includes(v);

const ALLOWED_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
type AllowedPriority = (typeof ALLOWED_PRIORITIES)[number];
const isAllowedPriority = (v: string): v is AllowedPriority =>
  (ALLOWED_PRIORITIES as readonly string[]).includes(v);

const ALLOWED_TYPES = ["RFQ", "GEN"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];
const isAllowedType = (v: string): v is AllowedType =>
  (ALLOWED_TYPES as readonly string[]).includes(v);

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const type = searchParams.get("type");
    const department = searchParams.get("department");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const roleName = profile.roles?.name || "";
    const isSuperAdmin = roleName === "super_admin";
    const userId = profile.id;
    const deptId = profile.department_id;

    let query = supabase
      .from("tickets")
      .select(
        `*,
        departments (id, code, name),
        creator:users!tickets_created_by_fkey (id, full_name, email),
        assignee:users!tickets_assigned_to_fkey (id, full_name, email)`,
        { count: "exact" }
      );

    if (status && status !== "all" && isAllowedStatus(status)) query = query.eq("status", status);
    if (priority && priority !== "all" && isAllowedPriority(priority)) query = query.eq("priority", priority);
    if (type && type !== "all" && isAllowedType(type)) query = query.eq("ticket_type", type);
    if (department && department !== "all") query = query.eq("department_id", department);
    if (search) query = query.or(`subject.ilike.%${search}%,ticket_code.ilike.%${search}%`);

    if (!isSuperAdmin) {
      if (deptId) {
        query = query.or(`created_by.eq.${userId},department_id.eq.${deptId}`);
      } else {
        query = query.eq("created_by", userId);
      }
    }

    const from = (Math.max(1, page) - 1) * Math.max(1, pageSize);
    query = query.range(from, from + Math.max(1, pageSize) - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, page),
        pageSize: Math.max(1, pageSize),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Math.max(1, pageSize)),
      },
    });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body: CreateTicketRequest = await request.json();
    const supabase = createAdminClient();

    if (!body.ticket_type || !body.subject || !body.department_id) {
      return NextResponse.json({ message: "Missing required fields", success: false }, { status: 400 });
    }

    if (!isAllowedType(body.ticket_type)) {
      return NextResponse.json({ message: "Invalid ticket type", success: false }, { status: 400 });
    }

    const priority: AllowedPriority =
      body.priority && isAllowedPriority(body.priority) ? body.priority : "medium";

    const description = body.description ?? "";

    const rfqData: Json =
      body.rfq_data ? (JSON.parse(JSON.stringify(body.rfq_data)) as Json) : null;

    const { data: ticketData, error: ticketError } = await supabase.rpc("create_ticket", {
      p_ticket_type: body.ticket_type,
      p_subject: body.subject,
      p_description: description,
      p_department_id: body.department_id,
      p_created_by: user.id,
      p_priority: priority,
      p_rfq_data: rfqData,
    });

    if (ticketError) {
      console.error("Ticket creation error:", ticketError);
      return NextResponse.json({ message: ticketError.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: ticketData }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
