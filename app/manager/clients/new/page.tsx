"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getAllAccountManagers } from "@/lib/supabase/queries/ams"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function NewClientPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [accountManagers, setAccountManagers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    commission: "20",
    am: "",
    notes: "",
  })

  useEffect(() => {
    getAllAccountManagers()
      .then((data) => {
        console.log("[v0] New client page - AMs from Supabase:", data?.length)
        setAccountManagers(data || [])
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error loading AMs:", error)
        setIsLoading(false)
      })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Création client, redirection vers /manager/clients")

    toast({
      title: "Client créé",
      description: `${formData.company} a été ajouté avec succès.`,
    })

    router.push("/manager/clients")
  }

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nouveau Client</h1>
              <p className="text-muted-foreground">Ajoutez un nouveau client à la plateforme</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informations du client</CardTitle>
                <CardDescription>
                  Renseignez les informations du client. Un accès à la plateforme sera automatiquement créé.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Société *</Label>
                    <Input
                      id="company"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="TechCorp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Secteur d'activité *</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Sélectionner un secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technologie</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="retail">Commerce</SelectItem>
                        <SelectItem value="healthcare">Santé</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Contact principal *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean.dupont@techcorp.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission">Notre commission (%) *</Label>
                    <Input
                      id="commission"
                      type="number"
                      required
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      placeholder="20"
                    />
                    <p className="text-xs text-muted-foreground">Commission appliquée sur les frais fixes des plans</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="am">Account Manager *</Label>
                  <Select value={formData.am} onValueChange={(value) => setFormData({ ...formData, am: value })}>
                    <SelectTrigger id="am">
                      <SelectValue placeholder="Assigner un AM" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountManagers.map((am) => (
                        <SelectItem key={am.id} value={am.id}>
                          {am.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> La création d'un client génère automatiquement un compte d'accès à la
                    plateforme. Le client recevra un email avec ses identifiants de connexion.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes additionnelles sur le client..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Créer le client
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/manager/clients">Annuler</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      )}
    </DashboardLayout>
  )
}
