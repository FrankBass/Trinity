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

export default function NewAffiliatePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [accountManagers, setAccountManagers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    typology: "",
    am: "",
    accountNumber: "",
    notes: "",
  })

  useEffect(() => {
    getAllAccountManagers()
      .then((data) => {
        console.log("[v0] New affiliate page - AMs from Supabase:", data?.length)
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

    console.log("[v0] Création affilié, redirection vers /manager/affiliates")

    toast({
      title: "Affilié créé",
      description: `${formData.name} a été ajouté avec succès.`,
    })

    router.push("/manager/affiliates")
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
              <h1 className="text-3xl font-bold tracking-tight">Nouvel Affilié</h1>
              <p className="text-muted-foreground">Ajoutez un nouvel affilié à la plateforme</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'affilié</CardTitle>
                <CardDescription>Renseignez les informations de l'affilié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Société</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nom de la société"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean.dupont@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Numéro de compte (SA) *</Label>
                  <Input
                    id="accountNumber"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase()
                      // Auto-add SA prefix if not present
                      if (value && !value.startsWith("SA")) {
                        value = "SA" + value.replace(/^SA/, "")
                      }
                      setFormData({ ...formData, accountNumber: value })
                    }}
                    placeholder="SA######"
                    pattern="SA[0-9]{6}"
                    title="Format: SA suivi de 6 chiffres (ex: SA123456)"
                  />
                  <p className="text-xs text-muted-foreground">Format: SA suivi de 6 chiffres (ex: SA123456)</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="typology">Typologie *</Label>
                    <Select
                      value={formData.typology}
                      onValueChange={(value) => setFormData({ ...formData, typology: value })}
                    >
                      <SelectTrigger id="typology">
                        <SelectValue placeholder="Sélectionner une typologie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apporteur">Apporteur d'affaires</SelectItem>
                        <SelectItem value="prescripteur">Prescripteur</SelectItem>
                        <SelectItem value="partenaire">Partenaire stratégique</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes additionnelles sur l'affilié..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Créer l'affilié
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/manager/affiliates">Annuler</Link>
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
