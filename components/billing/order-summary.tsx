interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // Add any additional fees/discounts here if needed

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Your Order</h2>
      
      <div className="space-y-4">
        <div className="border-b pb-4">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="text-sm font-medium text-gray-700">Product</th>
                <th className="text-sm font-medium text-gray-700 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="py-2">
                    {item.name} <span className="text-gray-500">× {item.quantity}</span>
                  </td>
                  <td className="py-2 text-right">
                    £{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>£{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            Sorry, it seems that there are no available payment methods. Please contact us if you require assistance or wish to make alternate arrangements.
          </p>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{" "}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
} 