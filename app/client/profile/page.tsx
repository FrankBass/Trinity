"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/lib/store/user-store"
import { Camera } from "lucide-react"

export default function ClientProfile() {
  const { user } = useUserStore()

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez les informations de votre entreprise</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Logo de l'entreprise</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Changer le logo
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>Mettez à jour les informations de votre société</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Nom de l'entreprise</Label>
                  <Input id="company" defaultValue="TechStore SAS" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre entreprise..."
                  className="min-h-[100px]"
                  defaultValue="Leader de l'e-commerce en France, spécialisé dans les produits technologiques."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" defaultValue="+33 1 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input id="website" type="url" defaultValue="https://techstore.fr" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" defaultValue="123 Avenue des Champs-Élysées, 75008 Paris" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input id="siret" defaultValue="123 456 789 00012" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva">N° TVA</Label>
                  <Input id="tva" defaultValue="FR12 345678901" />
                </div>
              </div>

              <Button>Enregistrer les modifications</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations bancaires</CardTitle>
            <CardDescription>Pour les paiements aux affiliés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" defaultValue="FR76 1234 5678 9012 3456 7890 123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bic">BIC</Label>
                <Input id="bic" defaultValue="BNPAFRPPXXX" />
              </div>
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
