"use client"

import type React from "react"
import { MousePointer, PenLine, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type StepIconProps = React.ComponentType<{ className?: string }>

type StepData = {
  icon: StepIconProps
  title: string
  description: string
}

type RegistrationStepsProps = {
  title?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  steps?: StepData[]
  className?: string
}

function Step({ number, icon: Icon, title, description }: { number: number } & StepData) {
  return (
    <div className="relative group overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      <div className="p-6 flex flex-col md:flex-col items-center text-center space-y-4 md:space-y-4">
        <div className="flex md:flex-col items-center md:items-center w-full md:w-auto space-x-4 md:space-x-0">
          <div className="bg-blue-50 p-4 rounded-full transition-colors group-hover:bg-blue-100">
            <Icon className="w-8 h-8 text-blue-600 group-hover:text-blue-800 transition-colors" />
          </div>
          <div className="space-y-2 text-left md:text-center">
            <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
              <span className="text-gray-400 mr-2">0{number}.</span> {title}
            </div>
            <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RegistrationSteps({
  title = "How to Get Started",
  subtitle = "Your account setup is quick and easy",
  buttonText = "CREATE ACCOUNT",
  buttonLink = "/sign-up",
  steps = [
    {
      icon: MousePointer,
      title: 'Create Account',
      description: 'Click the "Create Account" button',
    },
    {
      icon: PenLine,
      title: "Fill the Form",
      description: "Submit your personal information",
    },
    {
      icon: Mail,
      title: "Verify Email",
      description: "Check your inbox and click the verification link",
    },
    {
      icon: User,
      title: "Add/View Vehicles",
      description: "Add your vehicles or browse available listings",
    },
  ],
  className = ""
}: RegistrationStepsProps) {
  return (
    //to change bg color use this section
    <section className={`bg-gradient-to-br from-white-50 to-purple-50 py-16 ${className}`}> 
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          <Link href={buttonLink}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              {buttonText}
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Step 
              key={index} 
              number={index + 1} 
              icon={step.icon} 
              title={step.title} 
              description={step.description} 
            />
          ))}
        </div>
      </div>
    </section>
  )
}