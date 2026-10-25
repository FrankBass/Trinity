"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getClients } from "@/lib/supabase/queries/clients"

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const clientIdFromUrl = searchParams.get("client")

  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    client: clientIdFromUrl || "",
    startDate: "",
    endDate: "",
    budget: "",
    commission: "",
    objectives: "",
    mechanics: "",
    notes: "",
  })

  useEffect(() => {
    console.log("[v0] ========================================")
    console.log("[v0] PAGE CRÉATION CAMPAGNE CHARGÉE")
    console.log("[v0] ========================================")

    async function loadClients() {
      try {
        const clientsData = await getClients()
        setClients(clientsData)
        console.log("[v0] Clients loaded from Supabase:", clientsData?.length)
      } catch (error) {
        console.error("[v0] Error loading clients:", error)
      } finally {
        setLoading(false)
      }
    }
    loadClients()

    if (clientIdFromUrl) {
      setFormData((prev) => ({ ...prev, client: clientIdFromUrl }))
      console.log("[v0] Client pré-rempli depuis URL:", clientIdFromUrl)
    }
  }, [clientIdFromUrl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newCampaignId = Math.floor(Math.random() * 1000) + 1
    console.log("[v0] Création campagne, redirection vers:", `/manager/campaigns/${newCampaignId}`)

    toast({
      title: "Campagne créée",
      description: `${formData.name} a été créée avec succès.`,
    })

    router.push(`/manager/campaigns/${newCampaignId}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nouvelle Campagne</h1>
            <p className="text-muted-foreground">Créez une nouvelle opération commerciale pour un client</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informations de la campagne</CardTitle>
              <CardDescription>Définissez les paramètres de l'opération commerciale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la campagne *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Campagne Black Friday 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select value={formData.client} onValueChange={(value) => setFormData({ ...formData, client: value })}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        Chargement...
                      </SelectItem>
                    ) : (
                      (clients || []).map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      required
                      className="pl-9"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      required
                      className="pl-9"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget estimé (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="15000"
                />
                <p className="text-xs text-muted-foreground">Budget prévisionnel pour cette opération</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission">Commission pour cette OP (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                  placeholder="20"
                />
                <p className="text-xs text-muted-foreground">
                  La commission de l'OP surpasse celle définie lors de la création du client
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Objectifs de la campagne *</Label>
                <Textarea
                  id="objectives"
                  required
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  placeholder="Ex: Augmenter les ventes de 30%, générer 1000 leads qualifiés..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mechanics">Mécaniques prévues</Label>
                <Textarea
                  id="mechanics"
                  value={formData.mechanics}
                  onChange={(e) => setFormData({ ...formData, mechanics: e.target.value })}
                  placeholder="Ex: Code promo -20%, cashback 10€, offre 2+1 gratuit..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes additionnelles</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations complémentaires sur la campagne..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Créer la campagne
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/manager/campaigns">Annuler</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
