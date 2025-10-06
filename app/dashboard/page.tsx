import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ThreatList } from "@/components/dashboard/threat-list"
import { AgentStatus } from "@/components/dashboard/agent-status"
import { AlertTriangle, Shield, Server, Activity } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  // Fetch threats
  const { data: threats } = await supabase
    .from("threats")
    .select("*")
    .order("detected_at", { ascending: false })
    .limit(10)

  // Fetch agents
  const { data: agents } = await supabase
    .from("raspberry_pi_agents")
    .select("*")
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalThreats = threats?.length || 0
  const criticalThreats = threats?.filter((t) => t.severity === "critical").length || 0
  const activeThreats = threats?.filter((t) => t.status === "active").length || 0
  const onlineAgents = agents?.filter((a) => a.status === "online").length || 0
  const totalAgents = agents?.length || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Real-time threat monitoring and system overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Threats" value={totalThreats} icon={AlertTriangle} description="Last 24 hours" />
          <StatsCard
            title="Critical Threats"
            value={criticalThreats}
            icon={Shield}
            description="Requires immediate attention"
          />
          <StatsCard
            title="Active Threats"
            value={activeThreats}
            icon={Activity}
            description="Currently investigating"
          />
          <StatsCard
            title="Active Agents"
            value={`${onlineAgents}/${totalAgents}`}
            icon={Server}
            description="Raspberry Pi devices"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ThreatList threats={threats || []} limit={5} />
          <AgentStatus agents={agents || []} />
        </div>
      </div>
    </DashboardLayout>
  )
}
