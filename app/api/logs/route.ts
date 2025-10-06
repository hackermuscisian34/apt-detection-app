import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { agent_id, log_level, message, metadata } = body

    if (!log_level || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate log level
    if (!["info", "warning", "error", "critical"].includes(log_level)) {
      return NextResponse.json({ error: "Invalid log level" }, { status: 400 })
    }

    // Insert log
    const { data, error } = await supabase
      .from("system_logs")
      .insert({
        agent_id: agent_id || null,
        log_level,
        message,
        metadata: metadata || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, log: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const agent_id = searchParams.get("agent_id")
    const log_level = searchParams.get("log_level")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let query = supabase.from("system_logs").select("*").order("created_at", { ascending: false }).limit(limit)

    if (agent_id) {
      query = query.eq("agent_id", agent_id)
    }

    if (log_level) {
      query = query.eq("log_level", log_level)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ logs: data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
