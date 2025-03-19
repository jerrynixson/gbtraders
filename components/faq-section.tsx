import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto border rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">How to get the most money for your car</h2>

          <p className="text-gray-600 mb-8">
            Our online valuation tool can provide an estimate of your car's worth on the spot. When you are looking to
            sell your car, its value can be affected by other factors. Below are a few tips to help you get the best car
            valuation.
          </p>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold py-4">
                How to get the best car valuation?
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <p className="text-gray-600">
                  To get the best valuation for your car, make sure to provide accurate information about your vehicle's
                  condition, mileage, and service history. Clean your car thoroughly before any inspection, fix minor
                  issues, and gather all relevant documentation including the V5C logbook, MOT certificates, and service
                  records. Consider getting multiple valuations to compare offers.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold py-4">
                What factors increase the value of your used car?
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <p className="text-gray-600">Several factors can increase your car's value, including:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                  <li>Low mileage relative to the car's age</li>
                  <li>Full service history with stamps from authorized dealers</li>
                  <li>Popular color choices (silver, black, white)</li>
                  <li>Desirable optional extras and features</li>
                  <li>Good overall condition with minimal wear and tear</li>
                  <li>Remaining manufacturer warranty</li>
                  <li>Single ownership</li>
                  <li>Popular models with high demand</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold py-4">
                What decreases the value of a used car?
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <p className="text-gray-600">Factors that can decrease your car's value include:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                  <li>High mileage</li>
                  <li>Incomplete or missing service history</li>
                  <li>Previous accident damage or repairs</li>
                  <li>Unusual or unpopular color choices</li>
                  <li>Visible damage, dents, or scratches</li>
                  <li>Worn interior or exterior</li>
                  <li>Mechanical issues or warning lights</li>
                  <li>Multiple previous owners</li>
                  <li>Outdated or obsolete technology</li>
                  <li>Non-standard modifications</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}

