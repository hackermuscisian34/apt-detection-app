"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"
import { AlertTriangle, Shield, Activity } from "lucide-react"

type Threat = Database["public"]["Tables"]["threats"]["Row"]

interface ThreatListProps {
  threats: Threat[]
  limit?: number
}

const severityConfig = {
  critical: { color: "bg-red-500", textColor: "text-red-500", icon: AlertTriangle },
  high: { color: "bg-orange-500", textColor: "text-orange-500", icon: AlertTriangle },
  medium: { color: "bg-yellow-500", textColor: "text-yellow-500", icon: Shield },
  low: { color: "bg-blue-500", textColor: "text-blue-500", icon: Activity },
}

export function ThreatList({ threats, limit }: ThreatListProps) {
  const displayThreats = limit ? threats.slice(0, limit) : threats

  if (displayThreats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Threats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No threats detected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Threats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayThreats.map((threat) => {
            const config = severityConfig[threat.severity]
            const Icon = config.icon

            return (
              <div
                key={threat.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${config.color} bg-opacity-10`}>
                  <Icon className={`h-5 w-5 ${config.textColor}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{threat.threat_type}</p>
                    <Badge
                      variant={
                        threat.severity === "critical" || threat.severity === "high" ? "destructive" : "secondary"
                      }
                    >
                      {threat.severity}
                    </Badge>
                    <Badge variant="outline">{threat.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{threat.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {threat.source_ip && <span>Source: {threat.source_ip}</span>}
                    {threat.destination_ip && <span>Dest: {threat.destination_ip}</span>}
                    {threat.port && <span>Port: {threat.port}</span>}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(threat.detected_at), { addSuffix: true })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
