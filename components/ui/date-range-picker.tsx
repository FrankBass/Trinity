"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ date, onDateChange, className }: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(date)

  const handlePresetChange = (value: string) => {
    const today = new Date()
    let newRange: DateRange | undefined

    switch (value) {
      case "today":
        newRange = { from: today, to: today }
        break
      case "yesterday":
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        newRange = { from: yesterday, to: yesterday }
        break
      case "last7days":
        const last7 = new Date(today)
        last7.setDate(last7.getDate() - 7)
        newRange = { from: last7, to: today }
        break
      case "last30days":
        const last30 = new Date(today)
        last30.setDate(last30.getDate() - 30)
        newRange = { from: last30, to: today }
        break
      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        newRange = { from: startOfMonth, to: today }
        break
      case "lastMonth":
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        newRange = { from: startOfLastMonth, to: endOfLastMonth }
        break
      case "thisYear":
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        newRange = { from: startOfYear, to: today }
        break
      default:
        newRange = undefined
    }

    setSelectedRange(newRange)
    onDateChange?.(newRange)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Aujourd'hui</SelectItem>
          <SelectItem value="yesterday">Hier</SelectItem>
          <SelectItem value="last7days">7 derniers jours</SelectItem>
          <SelectItem value="last30days">30 derniers jours</SelectItem>
          <SelectItem value="thisMonth">Ce mois</SelectItem>
          <SelectItem value="lastMonth">Mois dernier</SelectItem>
          <SelectItem value="thisYear">Cette année</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !selectedRange && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, "dd MMM yyyy", { locale: fr })} -{" "}
                  {format(selectedRange.to, "dd MMM yyyy", { locale: fr })}
                </>
              ) : (
                format(selectedRange.from, "dd MMM yyyy", { locale: fr })
              )
            ) : (
              <span>Sélectionner une période</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedRange?.from}
            selected={selectedRange}
            onSelect={(range) => {
              setSelectedRange(range)
              onDateChange?.(range)
            }}
            numberOfMonths={2}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
