import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { agent_name, ip_address } = body

    if (!agent_name || !ip_address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if agent already exists
    const { data: existing } = await supabase
      .from("raspberry_pi_agents")
      .select("id")
      .eq("ip_address", ip_address)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Agent already registered" }, { status: 409 })
    }

    // Register new agent
    const { data, error } = await supabase
      .from("raspberry_pi_agents")
      .insert({
        agent_name,
        ip_address,
        status: "online",
        last_seen: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, agent: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
