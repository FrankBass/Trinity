"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Users, Target, FileText, UserCircle, Filter, X } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { searchStore, type SearchableEntity } from "@/lib/data/search-store"

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const typeIcons = {
  client: Building2,
  affiliate: Users,
  campaign: Target,
  plan: FileText,
  am: UserCircle,
}

const typeLabels = {
  client: "Clients",
  affiliate: "Affiliés",
  campaign: "Campagnes",
  plan: "Plans",
  am: "Account Managers",
}

const statusOptions = ["Actif", "En attente", "Validé", "Rejeté", "En cours", "Planifiée", "Terminée"]

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchableEntity[]>([])
  const [typeFilters, setTypeFilters] = useState<string[]>([])
  const [statusFilters, setStatusFilters] = useState<string[]>([])

  // Perform search when query or filters change
  useEffect(() => {
    const searchResults = searchStore.search(query, {
      type: typeFilters.length > 0 ? typeFilters : undefined,
      status: statusFilters.length > 0 ? statusFilters : undefined,
    })
    setResults(searchResults)
  }, [query, typeFilters, statusFilters])

  // Group results by type
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<string, SearchableEntity[]>,
  )

  const handleSelect = (link: string) => {
    router.push(link)
    onOpenChange(false)
    setQuery("")
  }

  const toggleTypeFilter = (type: string) => {
    setTypeFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const clearFilters = () => {
    setTypeFilters([])
    setStatusFilters([])
  }

  const hasActiveFilters = typeFilters.length > 0 || statusFilters.length > 0

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Recherche globale"
      description="Recherchez des clients, affiliés, campagnes, plans..."
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <CommandInput placeholder="Rechercher..." value={query} onValueChange={setQuery} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filtres
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {typeFilters.length + statusFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Filtres avancés</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs">
                    <X className="mr-1 h-3 w-3" />
                    Effacer
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Type d'entité</Label>
                <div className="space-y-2">
                  {Object.entries(typeLabels).map(([type, label]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={typeFilters.includes(type)}
                        onCheckedChange={() => toggleTypeFilter(type)}
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <CommandSeparator />

              <div className="space-y-2">
                <Label className="text-xs font-medium">Statut</Label>
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() => toggleStatusFilter(status)}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <CommandList>
        <CommandEmpty>
          {query || hasActiveFilters ? "Aucun résultat trouvé." : "Commencez à taper pour rechercher..."}
        </CommandEmpty>

        {Object.entries(groupedResults).map(([type, items]) => {
          const Icon = typeIcons[type as keyof typeof typeIcons]
          const label = typeLabels[type as keyof typeof typeLabels]

          return (
            <CommandGroup key={type} heading={label}>
              {items.map((item) => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  value={`${item.type}-${item.id}-${item.title}`}
                  onSelect={() => handleSelect(item.link)}
                  className="flex items-start gap-3 py-3"
                >
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      {item.status && (
                        <Badge variant="secondary" className="text-xs">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                    {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                    {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}
      </CommandList>
    </CommandDialog>
  )
}
