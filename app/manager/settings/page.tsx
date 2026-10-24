"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, MessageSquare, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useUser } from "@/lib/store/user-store"

export default function ManagerSettingsPage() {
  const { toast } = useToast()
  const { user, updateUser } = useUser()

  const [newPlans, setNewPlans] = useState(user?.notificationPreferences?.newPlans ?? true)
  const [performanceAlerts, setPerformanceAlerts] = useState(user?.notificationPreferences?.performanceAlerts ?? true)
  const [weeklyReports, setWeeklyReports] = useState(user?.notificationPreferences?.weeklyReports ?? false)
  const [messageNotifications, setMessageNotifications] = useState(
    user?.notificationPreferences?.messageNotifications ?? true,
  )

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (user?.notificationPreferences) {
      setNewPlans(user.notificationPreferences.newPlans)
      setPerformanceAlerts(user.notificationPreferences.performanceAlerts)
      setWeeklyReports(user.notificationPreferences.weeklyReports)
      setMessageNotifications(user.notificationPreferences.messageNotifications)
    }
  }, [user])

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été changé avec succès.",
    })

    setShowPasswordDialog(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleNotificationChange = (setting: string, value: boolean) => {
    const newPreferences = {
      newPlans,
      performanceAlerts,
      weeklyReports,
      messageNotifications,
      [setting]: value,
    }

    updateUser({
      notificationPreferences: newPreferences,
    })

    toast({
      title: "Préférence mise à jour",
      description: "Vos préférences de notification ont été enregistrées.",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Configurez vos préférences</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Gérez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouveaux plans</Label>
                  <p className="text-sm text-muted-foreground">Recevoir une notification pour chaque nouveau plan</p>
                </div>
                <Switch
                  checked={newPlans}
                  onCheckedChange={(checked) => {
                    setNewPlans(checked)
                    handleNotificationChange("newPlans", checked)
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertes performance</Label>
                  <p className="text-sm text-muted-foreground">Alertes sur la performance des AMs</p>
                </div>
                <Switch
                  checked={performanceAlerts}
                  onCheckedChange={(checked) => {
                    setPerformanceAlerts(checked)
                    handleNotificationChange("performanceAlerts", checked)
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapports hebdomadaires</Label>
                  <p className="text-sm text-muted-foreground">Recevoir un résumé chaque semaine</p>
                </div>
                <Switch
                  checked={weeklyReports}
                  onCheckedChange={(checked) => {
                    setWeeklyReports(checked)
                    handleNotificationChange("weeklyReports", checked)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <CardTitle>Messages</CardTitle>
              </div>
              <CardDescription>Préférences de messagerie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications de messages</Label>
                  <p className="text-sm text-muted-foreground">Recevoir les notifications de nouveaux messages</p>
                </div>
                <Switch
                  checked={messageNotifications}
                  onCheckedChange={(checked) => {
                    setMessageNotifications(checked)
                    handleNotificationChange("messageNotifications", checked)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <CardTitle>Sécurité</CardTitle>
              </div>
              <CardDescription>Paramètres de sécurité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Entrez votre mot de passe actuel et choisissez un nouveau mot de passe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleChangePassword}>Changer le mot de passe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
