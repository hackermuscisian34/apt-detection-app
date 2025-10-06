import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { agent_id, threat_type, severity, description, source_ip, destination_ip, port, protocol } = body

    if (!threat_type || !severity || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate severity
    if (!["low", "medium", "high", "critical"].includes(severity)) {
      return NextResponse.json({ error: "Invalid severity level" }, { status: 400 })
    }

    // Insert threat
    const { data, error } = await supabase
      .from("threats")
      .insert({
        agent_id: agent_id || null,
        threat_type,
        severity,
        description,
        source_ip: source_ip || null,
        destination_ip: destination_ip || null,
        port: port || null,
        protocol: protocol || null,
        status: "active",
        detected_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // The database trigger will automatically create notifications

    return NextResponse.json({ success: true, threat: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
