"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import type { Database } from "@/lib/types/database"
import { User, Bell, Shield, Save, CheckCircle2 } from "lucide-react"

type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchUserAndSettings()
  }, [])

  const fetchUserAndSettings = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)

      // Fetch or create user settings
      let { data: userSettings, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error && error.code === "PGRST116") {
        // Settings don't exist, create them
        const { data: newSettings } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            threat_severity_filter: ["low", "medium", "high", "critical"],
            auto_resolve_low_threats: false,
          })
          .select()
          .single()

        userSettings = newSettings
      }

      if (userSettings) {
        setSettings(userSettings)
      }
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    if (!settings || !user) return

    setSaving(true)
    const { error } = await supabase
      .from("user_settings")
      .update({
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        threat_severity_filter: settings.threat_severity_filter,
        auto_resolve_low_threats: settings.auto_resolve_low_threats,
      })
      .eq("user_id", user.id)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const toggleSeverityFilter = (severity: string) => {
    if (!settings) return

    const currentFilters = settings.threat_severity_filter || []
    const newFilters = currentFilters.includes(severity)
      ? currentFilters.filter((s) => s !== severity)
      : [...currentFilters, severity]

    setSettings({ ...settings, threat_severity_filter: newFilters })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and notification preferences</p>
        </div>

        {saved && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">User ID</Label>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{user?.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Account Created</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive threat alerts via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings?.email_notifications || false}
                onCheckedChange={(checked) =>
                  setSettings(settings ? { ...settings, email_notifications: checked } : null)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive real-time push notifications</p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings?.push_notifications || false}
                onCheckedChange={(checked) =>
                  setSettings(settings ? { ...settings, push_notifications: checked } : null)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Threat Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Threat Management</CardTitle>
            </div>
            <CardDescription>Configure threat detection and handling preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Threat Severity Filter</Label>
              <p className="text-sm text-muted-foreground">Select which threat severities to monitor</p>
              <div className="space-y-3">
                {["critical", "high", "medium", "low"].map((severity) => (
                  <div key={severity} className="flex items-center space-x-2">
                    <Checkbox
                      id={severity}
                      checked={settings?.threat_severity_filter?.includes(severity) || false}
                      onCheckedChange={() => toggleSeverityFilter(severity)}
                    />
                    <label
                      htmlFor={severity}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {severity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-resolve">Auto-resolve Low Threats</Label>
                <p className="text-sm text-muted-foreground">Automatically mark low severity threats as resolved</p>
              </div>
              <Switch
                id="auto-resolve"
                checked={settings?.auto_resolve_low_threats || false}
                onCheckedChange={(checked) =>
                  setSettings(settings ? { ...settings, auto_resolve_low_threats: checked } : null)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
