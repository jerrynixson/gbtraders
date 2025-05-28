import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - GB Trader',
  description: 'Privacy Policy and Terms & Conditions for GB Trader',
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy & Terms & Conditions</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
        <p className="mb-4">
          Thank you for reading this post, don't forget to subscribe!
        </p>
        <p className="mb-4">
          You can contact us by emailing: <a href="mailto:gbtrader.co.uk@gmail.com" className="text-blue-600 hover:underline">gbtrader.co.uk@gmail.com</a>
        </p>
        <p className="mb-4">
          Our website address is: <a href="https://gbtrader.co.uk" className="text-blue-600 hover:underline">https://gbtrader.co.uk</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Advertising Terms & Conditions</h2>
        <p className="mb-4">
          Please read these terms and conditions carefully as they govern our provision of digital advertising packages to you. We may amend these Terms from time to time, so please review these Terms periodically.
        </p>
        <p className="mb-4">
          In our Terms we mean Automotive Trading Limited. When we refer to GBTrader, this includes the website at www.gbtrader.co.uk and all other platforms including mobile devices, tablets and apps that we own and operate.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">GBTrader Agreement With You</h2>
        <p className="mb-4">
          These Terms apply to advertisements for the sale of cars placed on GBTrader by private advertisers and, together with all other policies and terms posted on the GBTrader website, are the terms and conditions we contract to provide you with access. It sets out the terms on which our platform and services. In which means by advertising with us, you agree to these terms.
        </p>
        <p className="mb-4">
          Every time we receive a request from you to advertise on GBTrader, a separate agreement is created between you and us in accordance with these Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Placing an Advert</h2>
        <div className="space-y-4">
          <p>When you advertise on GBTrader:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are given a username and password that are responsible for maintaining security.</li>
            <li>GBTrader shall not be liable for any failure to maintain the security of your username and password.</li>
            <li>We are not responsible for any losses you may suffer if a third party gains unauthorized access to your account, unless it is due to our negligence.</li>
            <li>You agree that the information provided during registration is true, accurate and complete.</li>
            <li>You also agree not to attempt to register under any other person's name or to accept offensive user names.</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ad Content Guidelines</h2>
        <div className="space-y-4">
          <ul className="list-disc pl-6 space-y-2">
            <li>Each ad can only contain one vehicle.</li>
            <li>Only one ad can be shown per car at a time.</li>
            <li>Images and videos must comply with all applicable laws and regulations.</li>
            <li>Content must not contain obscene or inappropriate material.</li>
            <li>Ads must be in English only.</li>
            <li>No spam or irrelevant content is permitted.</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Charges and Payment</h2>
        <div className="space-y-4">
          <p>The cost of advertising on GBTrader depends on the advertising package you choose and all prices are listed on GBTrader. All prices include consumption tax.</p>
          <p>Payment for adverts is made through online through GBTrader website.</p>
          <p>Payments can be made using Visa, MasterCard or Maestro. The card used for payment must be registered in the UK to be accepted.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Protection and Security</h2>
        <div className="space-y-4">
          <p>We take security very seriously and the GBTrader website offers advice on steps you can take to ensure your safety when selling your listing.</p>
          <p>By submitting an advertisement to us, you are requesting that the advertisement be displayed on GBTrader. This means that anyone in the world with access to the Internet can see ads and any information they contain.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <p className="mb-4">
          If you wish to contact us in writing, you can do so by emailing: <a href="mailto:gbtrader.co.uk@gmail.com" className="text-blue-600 hover:underline">gbtrader.co.uk@gmail.com</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Trade Advertising</h2>
        <div className="space-y-4">
          <p>If you are a trade seller operating as part of your business:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are not permitted to advertise as a private seller</li>
            <li>You must not falsely present yourself as a private seller</li>
            <li>Customers should be able to determine if an ad is related to a sale by a particular business or retailer</li>
            <li>It is an offense not to disclose the fact that you are a trader and you may be prosecuted for it</li>
          </ul>
        </div>
      </section>
    </div>
  )
} 