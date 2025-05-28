export function HowLeasingWorks() {
  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">How leasing works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Step-by-step</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Leasing works a bit like a long term rental. You rent it, but you don't own it.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Choose your car, pick your term and decide how many miles you'll drive</li>
            <li>Pay monthly rental payments for your chosen time length</li>
            <li>Drive it, enjoy it, then give it back at the end</li>
          </ul>
          <button className="mt-4 text-sm text-primary">Learn more about how it works</button>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">What you get</h3>
        </div>
      </div>
    </div>
  )
}

