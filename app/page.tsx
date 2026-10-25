"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Users, BarChart3, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                T
              </div>
              <span className="text-xl font-bold">Trinity</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">
                Avantages
              </Link>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Connexion
              </Link>
              <Button asChild>
                <Link href="/signup">Commencer</Link>
              </Button>
            </nav>
            <Button asChild className="md:hidden">
              <Link href="/login">Connexion</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Gérez vos partenariats d'affiliation en toute simplicité
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Trinity est la plateforme SaaS qui centralise la gestion de vos plans d'affiliation, de la soumission à
              l'approbation, avec un suivi complet des commissions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tout ce dont vous avez besoin</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Une plateforme complète pour gérer vos affiliations de A à Z
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Multi-rôles</h3>
              <p className="text-muted-foreground">
                Affiliés, clients, account managers, managers - chaque rôle a son interface dédiée
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Suivi en temps réel</h3>
              <p className="text-muted-foreground">
                Tableaux de bord avec KPIs, historique des plans, et notifications instantanées
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sécurisé</h3>
              <p className="text-muted-foreground">
                Contrôle d'accès par rôle, audit logs, et protection des données sensibles
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Workflow optimisé</h3>
              <p className="text-muted-foreground">
                Soumission, validation, négociation - tout le cycle de vie d'un plan simplifié
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Validation rapide</h3>
              <p className="text-muted-foreground">
                Approbation ou rejet en un clic, avec historique complet des modifications
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Calcul automatique</h3>
              <p className="text-muted-foreground">
                Commissions calculées automatiquement selon vos grilles de rémunération
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pourquoi choisir Trinity ?</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Interface intuitive</h3>
                <p className="text-muted-foreground">
                  Conçue pour être utilisée sans formation, avec des workflows clairs et logiques
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Responsive</h3>
                <p className="text-muted-foreground">Fonctionne parfaitement sur desktop, tablette et mobile</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Notifications intelligentes</h3>
                <p className="text-muted-foreground">
                  Restez informé des actions importantes avec des deep-links directs
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Historique complet</h3>
                <p className="text-muted-foreground">
                  Toutes les modifications sont tracées avec timeline et valeurs barrées
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Prêt à simplifier votre gestion d'affiliation ?
            </h2>
            <p className="mt-4 text-lg opacity-90">Rejoignez les entreprises qui font confiance à Trinity</p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                T
              </div>
              <span className="font-bold">Trinity</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Trinity. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
