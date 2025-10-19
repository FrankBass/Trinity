"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserStore } from "@/lib/store/user-store"
import { useToast } from "@/hooks/use-toast"
import { Loader2, LogIn } from "lucide-react"
import { authenticateUser } from "@/lib/auth/mock-users"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const setUser = useUserStore((state) => state.setUser)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = authenticateUser(email, password)

    if (!user) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    setUser(user)
    toast({
      title: "Connexion réussie",
      description: `Bienvenue, ${user.name}!`,
    })

    const roleRoutes: Record<string, string> = {
      affiliate: "/affiliate",
      client: "/client",
      am: "/am",
      manager: "/manager",
      pole_manager: "/pole-manager",
      admin: "/entity-admin",
      owner: "/owner",
    }

    const redirectPath = roleRoutes[user.role] || "/affiliate"
    router.push(redirectPath)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Trinity</h1>
          <p className="text-muted-foreground">Plateforme de gestion d'affiliation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous à votre compte Trinity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Comptes de test :</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• affiliate@trinity.com (Affilié)</p>
                <p>• client@trinity.com (Client)</p>
                <p>• am@trinity.com (Account Manager)</p>
                <p>• manager@trinity.com (Manager)</p>
                <p>• pole@trinity.com (Manager de Pôle)</p>
                <p>• admin@trinity.com (Admin d'Entité)</p>
                <p>• owner@trinity.com (Trinity Owner)</p>
                <p className="mt-2 font-medium">Mot de passe : password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
