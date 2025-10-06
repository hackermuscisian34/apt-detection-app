"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/types/database"
import { Server, Cpu, HardDrive, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Agent = Database["public"]["Tables"]["raspberry_pi_agents"]["Row"]

interface AgentStatusProps {
  agents: Agent[]
}

const statusConfig = {
  online: { color: "bg-green-500", badge: "default" as const },
  offline: { color: "bg-gray-500", badge: "secondary" as const },
  error: { color: "bg-red-500", badge: "destructive" as const },
}

export function AgentStatus({ agents }: AgentStatusProps) {
  if (agents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Raspberry Pi Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No agents connected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raspberry Pi Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => {
            const config = statusConfig[agent.status]

            return (
              <div key={agent.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color} bg-opacity-10`}>
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{agent.agent_name}</p>
                      <p className="text-sm text-muted-foreground">{agent.ip_address}</p>
                    </div>
                  </div>
                  <Badge variant={config.badge}>{agent.status}</Badge>
                </div>

                {agent.status === "online" && (
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">CPU</p>
                        <p className="text-sm font-medium">{agent.cpu_usage?.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Memory</p>
                        <p className="text-sm font-medium">{agent.memory_usage?.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Disk</p>
                        <p className="text-sm font-medium">{agent.disk_usage?.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {agent.last_seen && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last seen {formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true })}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
