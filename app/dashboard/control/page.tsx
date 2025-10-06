"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Database } from "@/lib/types/database"
import { Server, Plus, Trash2, Power, PowerOff, RefreshCw, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Agent = Database["public"]["Tables"]["raspberry_pi_agents"]["Row"]

export default function SystemControlPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [newAgent, setNewAgent] = useState({ name: "", ip: "" })
  const [error, setError] = useState("")
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchAgents()
    // Set up real-time subscription
    const channel = supabase
      .channel("agents-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "raspberry_pi_agents" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setAgents((prev) => [payload.new as Agent, ...prev])
        } else if (payload.eventType === "UPDATE") {
          setAgents((prev) => prev.map((a) => (a.id === payload.new.id ? (payload.new as Agent) : a)))
        } else if (payload.eventType === "DELETE") {
          setAgents((prev) => prev.filter((a) => a.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAgents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("raspberry_pi_agents")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setAgents(data)
    }
    setLoading(false)
  }

  const addAgent = async () => {
    setError("")
    if (!newAgent.name || !newAgent.ip) {
      setError("Please fill in all fields")
      return
    }

    const { error } = await supabase.from("raspberry_pi_agents").insert({
      agent_name: newAgent.name,
      ip_address: newAgent.ip,
      status: "offline",
    })

    if (error) {
      setError(error.message)
    } else {
      setAddDialogOpen(false)
      setNewAgent({ name: "", ip: "" })
    }
  }

  const deleteAgent = async () => {
    if (!selectedAgent) return

    const { error } = await supabase.from("raspberry_pi_agents").delete().eq("id", selectedAgent.id)

    if (!error) {
      setDeleteDialogOpen(false)
      setSelectedAgent(null)
    }
  }

  const updateAgentStatus = async (id: string, status: "online" | "offline") => {
    await supabase.from("raspberry_pi_agents").update({ status, last_seen: new Date().toISOString() }).eq("id", id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "default"
      case "offline":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Control</h1>
            <p className="text-muted-foreground">Manage Raspberry Pi agents and system operations</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System control operations can affect network security monitoring. Use with caution.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Raspberry Pi Agents ({agents.length})</CardTitle>
            <CardDescription>Monitor and control connected Raspberry Pi devices</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading agents...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8">
                <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No agents configured</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Agent
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <Card key={agent.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              agent.status === "online"
                                ? "bg-green-500/10"
                                : agent.status === "error"
                                  ? "bg-red-500/10"
                                  : "bg-gray-500/10"
                            }`}
                          >
                            <Server className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{agent.agent_name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{agent.ip_address}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(agent.status)}>{agent.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {agent.status === "online" && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CPU Usage:</span>
                            <span className="font-medium">{agent.cpu_usage?.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Memory:</span>
                            <span className="font-medium">{agent.memory_usage?.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Disk:</span>
                            <span className="font-medium">{agent.disk_usage?.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}

                      {agent.last_seen && (
                        <p className="text-xs text-muted-foreground">
                          Last seen {formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true })}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        {agent.status === "offline" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => updateAgentStatus(agent.id, "online")}
                          >
                            <Power className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => updateAgentStatus(agent.id, "offline")}
                          >
                            <PowerOff className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => fetchAgents()}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Agent Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Raspberry Pi Agent</DialogTitle>
            <DialogDescription>Register a new Raspberry Pi device for threat monitoring</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Pi-Gateway-01"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="e.g., 192.168.1.100"
                value={newAgent.ip}
                onChange={(e) => setNewAgent({ ...newAgent, ip: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addAgent}>Add Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the agent "{selectedAgent?.agent_name}" and all associated data. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAgent} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
