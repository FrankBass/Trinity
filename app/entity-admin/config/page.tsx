"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function ConfigPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground">Paramètres de l'entité</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de l'entité</CardTitle>
            <CardDescription>Informations générales de votre entité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entity-name">Nom de l'entité</Label>
              <Input id="entity-name" defaultValue="Trinity SAS" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-email">Email de contact</Label>
              <Input id="entity-email" type="email" defaultValue="contact@trinity.fr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-phone">Téléphone</Label>
              <Input id="entity-phone" defaultValue="+33 1 23 45 67 89" />
            </div>
            <Button>Enregistrer les modifications</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres système</CardTitle>
            <CardDescription>Configuration du système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">Recevoir les notifications importantes par email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Logs d'audit</Label>
                <p className="text-sm text-muted-foreground">Enregistrer toutes les actions des utilisateurs</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">Sauvegarder automatiquement les données chaque jour</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
