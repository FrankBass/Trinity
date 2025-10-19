// app/(dashboard)/affiliate/profile/page.tsx
"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AFF_USER, Typology } from "@/lib/aff-db"
import { useState } from "react"

export default function AffiliateProfile() {
  const [mode, setMode] = useState<"groupe" | "entite">(AFF_USER.structures.mode)
  const [groupName, setGroupName] = useState<string>(AFF_USER.structures.groupName || "")
  const [entities, setEntities] = useState<string[]>(AFF_USER.structures.entities || ["Poulpeo"])
  const [typology, setTypology] = useState<Typology>(AFF_USER.typology)

  const addEntity = () => setEntities((arr) => [...arr, ""])
  const updateEntity = (i: number, v: string) => setEntities((arr) => arr.map((x, idx) => (idx === i ? v : x)))
  const removeEntity = (i: number) => setEntities((arr) => arr.filter((_, idx) => idx !== i))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground">Structure affiliée & typologie</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Structure</CardTitle>
            <CardDescription>Déclarez si vous êtes un groupe (plusieurs entités affiliées) ou une entité unique.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(v: "groupe" | "entite") => setMode(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entite">Entité seule</SelectItem>
                    <SelectItem value="groupe">Groupe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Typologie</Label>
                <Select value={typology} onValueChange={(v: Typology) => setTypology(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="code_promo">Code Promo</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="content">Contenu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mode === "groupe" ? (
              <>
                <div className="space-y-2">
                  <Label>Nom du groupe</Label>
                  <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="ex. PlayBeacon" />
                </div>
                <div className="space-y-2">
                  <Label>Entités affiliées</Label>
                  <div className="space-y-2">
                    {entities.map((e, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={e} onChange={(ev) => updateEntity(i, ev.target.value)} placeholder="ex. Poulpeo" />
                        <Button variant="ghost" onClick={() => removeEntity(i)}>Supprimer</Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={addEntity}>Ajouter une entité</Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Nom de l’entité affiliée</Label>
                <Input value={entities[0] || ""} onChange={(e) => updateEntity(0, e.target.value)} placeholder="ex. Poulpeo" />
              </div>
            )}

            <Button className="mt-2">Enregistrer (front-only)</Button>
            <p className="text-xs text-muted-foreground">NB : démo front-only — ces réglages ne sont pas persistés côté serveur.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
