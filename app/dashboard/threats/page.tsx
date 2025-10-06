"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/lib/types/database"
import { format } from "date-fns"
import { Search, Filter, Eye, CheckCircle, AlertTriangle } from "lucide-react"

type Threat = Database["public"]["Tables"]["threats"]["Row"]

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [filteredThreats, setFilteredThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchThreats()
  }, [])

  useEffect(() => {
    filterThreats()
  }, [threats, searchQuery, severityFilter, statusFilter])

  const fetchThreats = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("threats").select("*").order("detected_at", { ascending: false })

    if (!error && data) {
      setThreats(data)
    }
    setLoading(false)
  }

  const filterThreats = () => {
    let filtered = [...threats]

    if (searchQuery) {
      filtered = filtered.filter(
        (threat) =>
          threat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          threat.threat_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          threat.source_ip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          threat.destination_ip?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((threat) => threat.severity === severityFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((threat) => threat.status === statusFilter)
    }

    setFilteredThreats(filtered)
  }

  const updateThreatStatus = async (id: string, status: "active" | "resolved" | "investigating") => {
    const updates: any = { status }
    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase.from("threats").update(updates).eq("id", id)

    if (!error) {
      setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
      if (selectedThreat?.id === id) {
        setSelectedThreat({ ...selectedThreat, ...updates })
      }
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "active":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "investigating":
        return <Eye className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Logs</h1>
          <p className="text-muted-foreground">View and manage all detected security threats</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter threat logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threats ({filteredThreats.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading threats...</div>
            ) : filteredThreats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No threats found</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source IP</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredThreats.map((threat) => (
                      <TableRow key={threat.id}>
                        <TableCell className="font-medium">{threat.threat_type}</TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(threat.severity)}>{threat.severity}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(threat.status)}
                            <span className="capitalize">{threat.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{threat.source_ip || "N/A"}</TableCell>
                        <TableCell>{format(new Date(threat.detected_at), "MMM dd, yyyy HH:mm")}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedThreat(threat)
                              setDetailsOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Threat Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Threat Details</DialogTitle>
            <DialogDescription>Detailed information about the detected threat</DialogDescription>
          </DialogHeader>
          {selectedThreat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Threat Type</p>
                  <p className="text-sm">{selectedThreat.threat_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Severity</p>
                  <Badge variant={getSeverityColor(selectedThreat.severity)}>{selectedThreat.severity}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedThreat.status)}
                    <span className="text-sm capitalize">{selectedThreat.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Detected At</p>
                  <p className="text-sm">{format(new Date(selectedThreat.detected_at), "PPpp")}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedThreat.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Source IP</p>
                  <p className="text-sm">{selectedThreat.source_ip || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destination IP</p>
                  <p className="text-sm">{selectedThreat.destination_ip || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Port</p>
                  <p className="text-sm">{selectedThreat.port || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Protocol</p>
                  <p className="text-sm">{selectedThreat.protocol || "N/A"}</p>
                </div>
              </div>

              {selectedThreat.resolved_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved At</p>
                  <p className="text-sm">{format(new Date(selectedThreat.resolved_at), "PPpp")}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => updateThreatStatus(selectedThreat.id, "investigating")}
                  disabled={selectedThreat.status === "investigating"}
                >
                  Mark as Investigating
                </Button>
                <Button
                  variant="default"
                  onClick={() => updateThreatStatus(selectedThreat.id, "resolved")}
                  disabled={selectedThreat.status === "resolved"}
                >
                  Mark as Resolved
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
