import { Button } from "@/components/ui/button"

type CreateAdButtonProps = {
  isDisabled: boolean
  isLoading: boolean
}

export function CreateAdButton({ isDisabled, isLoading }: CreateAdButtonProps) {
  return (
    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isDisabled || isLoading}>
      {isLoading ? "Creating your ad..." : "Create your ad"}
    </Button>
  )
}

