"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v0] Error occurred:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Une erreur est survenue</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Nous sommes désolés, une erreur inattendue s'est produite. Veuillez réessayer.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Réessayer</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}
