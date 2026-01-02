import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import type { CreateTicketRequest } from "@/types/api";

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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const roleName = profile.roles?.name || profile.role?.name || "";
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

    if (status && status !== "all") query = query.eq("status", status);
    if (priority && priority !== "all") query = query.eq("priority", priority);
    if (type && type !== "all") query = query.eq("ticket_type", type);
    if (department && department !== "all") query = query.eq("department_id", department);
    if (search) query = query.or(`subject.ilike.%${search}%,ticket_code.ilike.%${search}%`);

    if (!isSuperAdmin) {
      if (deptId) {
        query = query.or(`created_by.eq.${userId},department_id.eq.${deptId}`);
      } else {
        query = query.eq("created_by", userId);
      }
    }

    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, pageSize, total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) },
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

    const { data: ticketData, error: ticketError } = await supabase.rpc("create_ticket", {
      p_ticket_type: body.ticket_type,
      p_subject: body.subject,
      p_description: body.description || null,
      p_department_id: body.department_id,
      p_created_by: user.id,
      p_priority: body.priority || "medium",
      p_rfq_data: body.rfq_data || null,
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
