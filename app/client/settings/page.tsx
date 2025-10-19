"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ClientSettings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de commission</CardTitle>
            <CardDescription>Définissez vos taux de commission par défaut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-commission">Commission par défaut (%)</Label>
                <Input id="default-commission" type="number" defaultValue="15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookie-duration">Durée du cookie (jours)</Label>
                <Input id="cookie-duration" type="number" defaultValue="30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-payout">Paiement minimum (€)</Label>
              <Input id="min-payout" type="number" defaultValue="50" />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nouvelles inscriptions</Label>
                <p className="text-sm text-muted-foreground">Soyez notifié des nouveaux affiliés</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nouvelles ventes</Label>
                <p className="text-sm text-muted-foreground">Notifications en temps réel des ventes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rapports hebdomadaires</Label>
                <p className="text-sm text-muted-foreground">Recevez un résumé chaque semaine</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertes de performance</Label>
                <p className="text-sm text-muted-foreground">Notifications sur les performances inhabituelles</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation des affiliés</CardTitle>
            <CardDescription>Gérez le processus d'approbation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Approbation automatique</Label>
                <p className="text-sm text-muted-foreground">Les nouveaux affiliés sont approuvés automatiquement</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="approval-criteria">Critères d'approbation</Label>
              <Select defaultValue="manual">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Validation manuelle</SelectItem>
                  <SelectItem value="auto">Automatique</SelectItem>
                  <SelectItem value="criteria">Basé sur des critères</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>Gérez la sécurité de votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>Changer le mot de passe</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
