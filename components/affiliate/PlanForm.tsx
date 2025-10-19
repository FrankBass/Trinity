"use client"

import { useMemo, useState } from "react"

type PlanStatus =
  | "Draft"
  | "Submitted"
  | "InDiscussion"
  | "ValidatedAffiliate"
  | "PendingClient"
  | "ClientApproved"
  | "ClientRejected"

type Operation = {
  id: string
  brand: string
  client: string
  name: string
  start: string
  end: string
  details: string
  allowedTypologies: string[]
  caps: { ffMax: number; hdrMax: number }
  hdrBaseByTypology: Record<string, number>
  hdrOldNew?: { baseNew: number; maxNew: number; baseOld: number; maxOld: number }
}

type AffiliateContext = {
  typology: string
  affiliateEntities: string[]
}

type PlanInput = {
  affiliateEntity: string
  placements: string
  hdrMode: "defaultPlus" | "manual"
  hdrNew?: number
  hdrOld?: number
  ff?: number
  comment?: string
  attachmentName?: string
}

type Props = {
  operation: Operation
  ctx: AffiliateContext
  onSaveDraft: (payload: {
    status: PlanStatus
    opId: string
    data: PlanInput
  }) => void
  onSubmit: (payload: {
    status: PlanStatus
    opId: string
    data: PlanInput
  }) => void
  existingPlan?: Partial<PlanInput>
}

export default function PlanForm({ operation, ctx, onSaveDraft, onSubmit, existingPlan }: Props) {
  const [data, setData] = useState<PlanInput>(() => ({
    affiliateEntity: existingPlan?.affiliateEntity ?? ctx.affiliateEntities[0],
    placements: existingPlan?.placements ?? "",
    hdrMode: existingPlan?.hdrMode ?? "defaultPlus",
    hdrNew: existingPlan?.hdrNew,
    hdrOld: existingPlan?.hdrOld,
    ff: existingPlan?.ff,
    comment: existingPlan?.comment ?? "",
    attachmentName: existingPlan?.attachmentName,
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})

  const bases = useMemo(() => {
    const baseTypo = ctx.typology in operation.hdrBaseByTypology ? operation.hdrBaseByTypology[ctx.typology] : 0
    const hasOldNew = Boolean(operation.hdrOldNew)
    return {
      hasOldNew,
      baseTypo,
      maxTypo: operation.caps.hdrMax,
      baseNew: operation.hdrOldNew?.baseNew ?? baseTypo,
      maxNew: operation.hdrOldNew?.maxNew ?? operation.caps.hdrMax,
      baseOld: operation.hdrOldNew?.baseOld ?? baseTypo,
      maxOld: operation.hdrOldNew?.maxOld ?? operation.caps.hdrMax,
      ffMax: operation.caps.ffMax,
    }
  }, [operation, ctx.typology])

  function setField<K extends keyof PlanInput>(key: K, value: PlanInput[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}

    const lines = (data.placements || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) e.placements = "Ajoutez au moins un emplacement (1 ligne = 1 emplacement)."
    if (lines.length > 50) e.placements = "Maximum 50 emplacements par soumission."

    if (bases.hasOldNew) {
      if (data.hdrMode === "defaultPlus") {
        if (data.hdrNew == null || data.hdrNew < 0) e.hdrNew = "Indiquez le +% pour Nouveaux clients (≥ 0)."
        if (data.hdrNew != null && data.hdrNew > bases.maxNew)
          e.hdrNew = `+% Nouveaux au-delà du max autorisé (+${bases.maxNew}%).`

        if (data.hdrOld == null || data.hdrOld < 0) e.hdrOld = "Indiquez le +% pour Anciens clients (≥ 0)."
        if (data.hdrOld != null && data.hdrOld > bases.maxOld)
          e.hdrOld = `+% Anciens au-delà du max autorisé (+${bases.maxOld}%).`
      } else {
        if (data.hdrNew == null || data.hdrNew < 0) e.hdrNew = "Indiquez la HDR finale Nouveaux (%)."
        if (data.hdrNew != null && data.hdrNew > bases.baseNew + bases.maxNew)
          e.hdrNew = `HDR Nouveaux > ${bases.baseNew + bases.maxNew}% (base ${bases.baseNew}% + max +${bases.maxNew}%).`

        if (data.hdrOld == null || data.hdrOld < 0) e.hdrOld = "Indiquez la HDR finale Anciens (%)."
        if (data.hdrOld != null && data.hdrOld > bases.baseOld + bases.maxOld)
          e.hdrOld = `HDR Anciens > ${bases.baseOld + bases.maxOld}% (base ${bases.baseOld}% + max +${bases.maxOld}%).`
      }
    } else {
      if (data.hdrMode === "defaultPlus") {
        if (data.hdrNew == null || data.hdrNew < 0) e.hdrNew = "Indiquez le +% demandé (≥ 0)."
        if (data.hdrNew != null && data.hdrNew > bases.maxTypo)
          e.hdrNew = `+% au-delà du max autorisé (+${bases.maxTypo}%).`
      } else {
        if (data.hdrNew == null || data.hdrNew < 0) e.hdrNew = "Indiquez la HDR finale demandée (%)."
        if (data.hdrNew != null && data.hdrNew > bases.baseTypo + bases.maxTypo)
          e.hdrNew = `HDR finale > ${bases.baseTypo + bases.maxTypo}% (base ${bases.baseTypo}% + max +${bases.maxTypo}%).`
      }
    }

    if (data.ff != null) {
      if (data.ff < 0) e.ff = "Montant invalide."
      if (data.ff > bases.ffMax) e.ff = `Frais fixes > plafond autorisé (${bases.ffMax} €).`
    }

    if (!data.affiliateEntity) e.affiliateEntity = "Sélectionnez votre entité affiliée."

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleDraft() {
    if (!validate()) return
    onSaveDraft({ status: "Draft", opId: operation.id, data })
  }

  function handleSubmit() {
    if (!validate()) return
    onSubmit({ status: "Submitted", opId: operation.id, data })
  }

  const hdrHelp = bases.hasOldNew
    ? data.hdrMode === "defaultPlus"
      ? `Bases: Nouveaux ${bases.baseNew}%, Anciens ${bases.baseOld}% — Max +${bases.maxNew}% / +${bases.maxOld}%`
      : `Maximums: Nouveaux ≤ ${bases.baseNew + bases.maxNew}%, Anciens ≤ ${bases.baseOld + bases.maxOld}%`
    : data.hdrMode === "defaultPlus"
      ? `Base typologie: ${bases.baseTypo}% — Max +${bases.maxTypo}%`
      : `Maximum: ≤ ${bases.baseTypo + bases.maxTypo}% (base ${bases.baseTypo}% + max +${bases.maxTypo}%)`

  return (
    <section id="form" className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Proposer un plan</h3>
        <span className="text-sm text-muted-foreground">
          FF max {bases.ffMax}€ • {hdrHelp}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Entité affiliée</span>
            <select
              className="mt-1 w-full rounded-md border bg-background p-2"
              value={data.affiliateEntity}
              onChange={(e) => setField("affiliateEntity", e.target.value)}
            >
              {ctx.affiliateEntities.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
            {errors.affiliateEntity && <p className="text-sm text-red-500 mt-1">{errors.affiliateEntity}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium">Emplacements (1 ligne = 1 emplacement)</span>
            <textarea
              rows={6}
              placeholder={"Homepage Hero – Semaine 1\nCatégorie Mode – Bloc top – Semaine 2\nNewsletter #3 – 28/10"}
              className="mt-1 w-full rounded-md border bg-background p-2"
              value={data.placements}
              onChange={(e) => setField("placements", e.target.value)}
            />
            {errors.placements && <p className="text-sm text-red-500 mt-1">{errors.placements}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium">Pièce jointe (option)</span>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0]
                setField("attachmentName", f ? f.name : undefined)
              }}
              className="mt-1 block w-full text-sm"
            />
            {data.attachmentName && (
              <p className="text-xs text-muted-foreground mt-1">Fichier : {data.attachmentName}</p>
            )}
          </label>
        </div>

        <div className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">HDR (poste de rémunération)</legend>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={data.hdrMode === "defaultPlus"}
                  onChange={() => setField("hdrMode", "defaultPlus")}
                />
                <span className="text-sm">Utiliser la base (saisir un +%)</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={data.hdrMode === "manual"}
                  onChange={() => setField("hdrMode", "manual")}
                />
                <span className="text-sm">Saisie manuelle (valeur finale %)</span>
              </label>
            </div>

            {bases.hasOldNew ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-muted-foreground">
                    {data.hdrMode === "defaultPlus"
                      ? `+% Nouveaux (base ${bases.baseNew}%)`
                      : `HDR Nouveaux (%) (max ${bases.baseNew + bases.maxNew})`}
                  </span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border bg-background p-2"
                    value={data.hdrNew ?? ""}
                    onChange={(e) => setField("hdrNew", e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                  {errors.hdrNew && <p className="text-xs text-red-500 mt-1">{errors.hdrNew}</p>}
                </label>

                <label className="block">
                  <span className="text-xs text-muted-foreground">
                    {data.hdrMode === "defaultPlus"
                      ? `+% Anciens (base ${bases.baseOld}%)`
                      : `HDR Anciens (%) (max ${bases.baseOld + bases.maxOld})`}
                  </span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border bg-background p-2"
                    value={data.hdrOld ?? ""}
                    onChange={(e) => setField("hdrOld", e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                  {errors.hdrOld && <p className="text-xs text-red-500 mt-1">{errors.hdrOld}</p>}
                </label>
              </div>
            ) : (
              <label className="block">
                <span className="text-xs text-muted-foreground">
                  {data.hdrMode === "defaultPlus"
                    ? `+% sur base ${bases.baseTypo}% (max +${bases.maxTypo}%)`
                    : `HDR finale (%) (max ${bases.baseTypo + bases.maxTypo})`}
                </span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border bg-background p-2"
                  value={data.hdrNew ?? ""}
                  onChange={(e) => setField("hdrNew", e.target.value === "" ? undefined : Number(e.target.value))}
                />
                {errors.hdrNew && <p className="text-xs text-red-500 mt-1">{errors.hdrNew}</p>}
              </label>
            )}
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium">Frais fixes (€)</span>
            <input
              type="number"
              placeholder={`≤ ${bases.ffMax}`}
              className="mt-1 w-full rounded-md border bg-background p-2"
              value={data.ff ?? ""}
              onChange={(e) => setField("ff", e.target.value === "" ? undefined : Number(e.target.value))}
            />
            {errors.ff && <p className="text-xs text-red-500 mt-1">{errors.ff}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium">Commentaire</span>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-md border bg-background p-2"
              value={data.comment ?? ""}
              onChange={(e) => setField("comment", e.target.value)}
              placeholder="Contexte, inventaire, ciblage, précisions…"
            />
          </label>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pt-4 pb-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button type="button" onClick={handleDraft} className="rounded-md border px-4 py-2">
          Enregistrer brouillon
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2"
        >
          Soumettre à l'AM
        </button>
      </div>
    </section>
  )
}
