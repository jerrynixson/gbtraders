import type React from "react"
import { MousePointer, PenLine, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type StepProps = {
  number: number
  icon: React.ReactNode
  title: string
  description: string
}

function Step({ number, icon, title, description }: StepProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-colors hover:bg-destructive hover:text-white group">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="text-gray-600 group-hover:text-white">{icon}</div>
        <div className="space-y-2">
          <div className="font-medium">
            {number}. {title}
          </div>
          <p className="text-sm text-gray-500 group-hover:text-white/90">{description}</p>
        </div>
      </div>
    </div>
  )
}

export function RegistrationSteps() {
  const steps = [
    {
      icon: <MousePointer className="h-6 w-6" />,
      title: 'Click the "Start Account" button',
      description: 'Click the "Start Account" button',
    },
    {
      icon: <PenLine className="h-6 w-6" />,
      title: "Fill the short form",
      description: "and submit your info",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Check your email",
      description: "and click the verify link",
    },
    {
      icon: <User className="h-6 w-6" />,
      title: "Log in and start",
      description: "buying and selling",
    },
  ]

  return (
    <section
      className="relative py-16 bg-cover bg-center"
      style={{ backgroundImage: "url(/register-banner.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-white mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-2">How To Register With Us</h2>
            <p>Registering is simple, and should only take about a minute.</p>
          </div>
          <Link href="/sign-up">
            <Button className="bg-destructive hover:bg-destructive/90 text-white">START ACCOUNT</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Step key={index} number={index + 1} icon={step.icon} title={step.title} description={step.description} />
          ))}
        </div>
      </div>
    </section>
  )
}

