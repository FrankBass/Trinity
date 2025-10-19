// app/(dashboard)/affiliate/notifications/page.tsx
"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getNotifs, setNotifs } from "@/lib/aff-db"
import Link from "next/link"
import { useState } from "react"
import { Bell, CheckCheck } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(getNotifs())
  const unread = notifications.filter((n) => !n.read).length
  const mark = (id?: string) => {
    const updated = notifications.map((n) => (id ? (n.id === id ? { ...n, read: true } : n) : { ...n, read: true }))
    setNotifications(updated)
    setNotifs(updated)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              {unread} notification{unread > 1 ? "s" : ""} non lue{unread > 1 ? "s" : ""}
            </p>
          </div>
          {unread > 0 && (
            <Button variant="outline" onClick={() => mark()}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune notification</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((n) => (
              <Card key={n.id} className={!n.read ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{n.title}</CardTitle>
                        {!n.read && <Badge variant="default">Nouveau</Badge>}
                        <Badge variant="outline" className="text-xs">
                          {n.type === "plan_update" ? "Plan" : n.type === "client_decision" ? "Décision" : "OP"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                    </div>
                    <div className="flex gap-2">
                      {!n.read && (
                        <Button variant="ghost" size="sm" onClick={() => mark(n.id)}>
                          Marquer comme lu
                        </Button>
                      )}
                      <Button asChild size="sm" variant={!n.read ? "default" : "outline"}>
                        <Link href={n.deepLink}>Voir</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
