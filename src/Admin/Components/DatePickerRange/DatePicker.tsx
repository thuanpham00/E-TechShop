import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "src/lib/utils"
import { Button } from "src/Components/ui/button"
import { Calendar } from "src/Components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "src/Components/ui/popover"

export function DatePicker({ value, onChange }: { value: Date; onChange: (value: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-[240px] justify-start text-left font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon />
          {value ? format(value, "PPP") : <span>dd/MM/yyyy</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (date) {
              onChange(date)
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
