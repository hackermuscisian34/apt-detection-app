export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      raspberry_pi_agents: {
        Row: {
          id: string
          agent_name: string
          ip_address: string
          status: "online" | "offline" | "error"
          last_seen: string | null
          cpu_usage: number | null
          memory_usage: number | null
          disk_usage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_name: string
          ip_address: string
          status?: "online" | "offline" | "error"
          last_seen?: string | null
          cpu_usage?: number | null
          memory_usage?: number | null
          disk_usage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_name?: string
          ip_address?: string
          status?: "online" | "offline" | "error"
          last_seen?: string | null
          cpu_usage?: number | null
          memory_usage?: number | null
          disk_usage?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      threats: {
        Row: {
          id: string
          agent_id: string | null
          threat_type: string
          severity: "low" | "medium" | "high" | "critical"
          description: string
          source_ip: string | null
          destination_ip: string | null
          port: number | null
          protocol: string | null
          status: "active" | "resolved" | "investigating"
          detected_at: string
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          threat_type: string
          severity: "low" | "medium" | "high" | "critical"
          description: string
          source_ip?: string | null
          destination_ip?: string | null
          port?: number | null
          protocol?: string | null
          status?: "active" | "resolved" | "investigating"
          detected_at?: string
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          threat_type?: string
          severity?: "low" | "medium" | "high" | "critical"
          description?: string
          source_ip?: string | null
          destination_ip?: string | null
          port?: number | null
          protocol?: string | null
          status?: "active" | "resolved" | "investigating"
          detected_at?: string
          resolved_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          threat_id: string | null
          title: string
          message: string
          type: "threat" | "system" | "agent"
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          threat_id?: string | null
          title: string
          message: string
          type: "threat" | "system" | "agent"
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          threat_id?: string | null
          title?: string
          message?: string
          type?: "threat" | "system" | "agent"
          is_read?: boolean
          created_at?: string
        }
      }
      system_logs: {
        Row: {
          id: string
          agent_id: string | null
          log_level: "info" | "warning" | "error" | "critical"
          message: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          log_level: "info" | "warning" | "error" | "critical"
          message: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          log_level?: "info" | "warning" | "error" | "critical"
          message?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          threat_severity_filter: string[]
          auto_resolve_low_threats: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          threat_severity_filter?: string[]
          auto_resolve_low_threats?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          threat_severity_filter?: string[]
          auto_resolve_low_threats?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
