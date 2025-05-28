import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | GB Traders',
  description: 'Learn more about GB Traders and our mission to revolutionize the automotive marketplace.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About GB Traders</h1>
      <div className="prose max-w-none">
        {/* Add your about content here */}
        <p>Welcome to GB Traders, your trusted automotive marketplace.</p>
      </div>
    </div>
  );
} 