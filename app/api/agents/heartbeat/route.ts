import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { agent_id, cpu_usage, memory_usage, disk_usage } = body

    if (!agent_id) {
      return NextResponse.json({ error: "Missing agent_id" }, { status: 400 })
    }

    // Update agent status and metrics
    const { error } = await supabase
      .from("raspberry_pi_agents")
      .update({
        status: "online",
        last_seen: new Date().toISOString(),
        cpu_usage: cpu_usage || null,
        memory_usage: memory_usage || null,
        disk_usage: disk_usage || null,
      })
      .eq("id", agent_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
