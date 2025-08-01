import { cn } from "@/lib/utils"

interface DetailItemProps {
  label: string
  value: string | number | null | undefined | boolean
  className?: string
}

const isValidValue = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && (value.trim() === '' || value === 'N/A' || value === 'undefined')) return false
  if (typeof value === 'number' && isNaN(value)) return false
  return true
}

export function DetailItem({ label, value, className }: DetailItemProps) {
  if (!isValidValue(value)) return null
  
  const displayValue = typeof value === 'boolean' 
    ? value ? 'Yes' : 'No'
    : String(value)
  
  return (
    <div className={cn("space-y-0.5", className)}>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-900 break-words">
        {displayValue}
      </dd>
    </div>
  )
}
