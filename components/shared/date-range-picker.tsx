"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  getMonthRange,
  getLastNMonthsRange,
  getYearRange,
  formatDateRange,
  type DateRange,
} from "@/lib/utils/date-range"

type Preset = "month" | "3months" | "6months" | "year" | "custom"

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [preset, setPreset] = React.useState<Preset>("month")
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetChange = (newPreset: Preset) => {
    setPreset(newPreset)
    const now = new Date()

    switch (newPreset) {
      case "month":
        onChange(getMonthRange(now))
        break
      case "3months":
        onChange(getLastNMonthsRange(3))
        break
      case "6months":
        onChange(getLastNMonthsRange(6))
        break
      case "year":
        onChange(getYearRange(now))
        break
      case "custom":
        // Keep current range, user will select dates
        break
    }

    if (newPreset !== "custom") {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Ce mois</SelectItem>
          <SelectItem value="3months">3 derniers mois</SelectItem>
          <SelectItem value="6months">6 derniers mois</SelectItem>
          <SelectItem value="year">Année en cours</SelectItem>
          <SelectItem value="custom">Personnalisée</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(value)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: value.from, to: value.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onChange({ from: range.from, to: range.to })
                  setIsOpen(false)
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
