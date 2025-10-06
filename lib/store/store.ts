import { create } from "zustand"
import type { Database } from "@/lib/types/database"

type Threat = Database["public"]["Tables"]["threats"]["Row"]
type Agent = Database["public"]["Tables"]["raspberry_pi_agents"]["Row"]
type Notification = Database["public"]["Tables"]["notifications"]["Row"]

interface AppState {
  threats: Threat[]
  agents: Agent[]
  notifications: Notification[]
  unreadCount: number
  setThreats: (threats: Threat[]) => void
  setAgents: (agents: Agent[]) => void
  setNotifications: (notifications: Notification[]) => void
  addThreat: (threat: Threat) => void
  updateThreat: (id: string, updates: Partial<Threat>) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  threats: [],
  agents: [],
  notifications: [],
  unreadCount: 0,
  setThreats: (threats) => set({ threats }),
  setAgents: (agents) => set({ agents }),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),
  addThreat: (threat) => set((state) => ({ threats: [threat, ...state.threats] })),
  updateThreat: (id, updates) =>
    set((state) => ({
      threats: state.threats.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}))
