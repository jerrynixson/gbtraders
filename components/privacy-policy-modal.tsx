import { X } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Privacy Policy & Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Who We Are</h3>
            <p className="mb-4">
              Thank you for reading this post, don't forget to subscribe!
            </p>
            <p className="mb-4">
              You can contact us by emailing: <a href="mailto:gbtrader.co.uk@gmail.com" className="text-indigo-600 hover:underline">gbtrader.co.uk@gmail.com</a>
            </p>
            <p className="mb-4">
              Our website address is: <a href="https://gbtrader.co.uk" className="text-indigo-600 hover:underline">https://gbtrader.co.uk</a>
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Advertising Terms & Conditions</h3>
            <p className="mb-4">
              Please read these terms and conditions carefully as they govern our provision of digital advertising packages to you. We may amend these Terms from time to time, so please review these Terms periodically.
            </p>
            <p className="mb-4">
              In our Terms we mean Automotive Trading Limited. When we refer to GBTrader, this includes the website at www.gbtrader.co.uk and all other platforms including mobile devices, tablets and apps that we own and operate.
            </p>
            <p className="mb-4">
              These Terms apply to ads posted, updated and/or modified until the ad expires, is changed or renewed.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">GBTrader Agreement With You</h3>
            <p className="mb-4">
              These Terms apply to advertisements for the sale of cars placed on GBTrader by private advertisers and, together with all other policies and terms posted on the GBTrader website, are the terms and conditions we contract to provide you with access. It sets out the terms on which our platform and services. In which means by advertising with us, you agree to these terms.
            </p>
            <p className="mb-4">
              Every time we receive a request from you to advertise on GBTrader, a separate agreement is created between you and us in accordance with these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Placing an Advert</h3>
            <div className="space-y-4">
              <p>When you advertise on GBTrader:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are given a username and password that are responsible for maintaining security.</li>
                <li>GBTrader shall not be liable for any failure to maintain the security of your username and password.</li>
                <li>We are not responsible for any losses you may suffer if a third party gains unauthorized access to your account, unless it is due to our negligence.</li>
                <li>You agree that the information provided during registration is true, accurate and complete.</li>
                <li>You also agree not to attempt to register under any other person's name or to accept offensive user names.</li>
                <li>All personal information provided by you as part of the registration process will be retained and used in accordance with our terms Privacy and policy.</li>
                <li>When you agreed to confirming that you want to advertise, we will not use the details obtained from any Motor Insurance Anti-Fraud or theft Register (MIAFTR), which is operated by Insurance Database Services Limited, to check if a vehicle is to be advertised. Its buyer's responsibility to check before contacting or purchasing.</li>
                <li>GBTrader will not take responsibility to any advertise CAT A or CAT B vehicles or vehicles that fall into these categories.</li>
                <li>If a potential customer wishes to purchase a vehicle, the history for the vehicle not shown in the advertisement, but there are links hosted by Experian Limited take where they can request them to a website for a vehicle history test.</li>
                <li>GBTrader does not disclose the registration number directly to the prospective purchaser, but the registration mark will be made available to the prospective purchaser when purchasing a dated check from Experian Limited after the prospective purchaser.</li>
                <li>If we accept your ad, we aim to process and publish any ad submitted online within 24 hours of receiving it, although we cannot guarantee timelines.</li>
                <li>Posted Ads may appear on all GBTrader platforms, including desktop, mobile, tablet and all third party social media platforms where GBTrader is active. It may also appear on the Smart Buying Platform and other partner websites.</li>
                <li>Once your ad has been approved to run, you will receive an email confirmation that your ad has been placed on GBTrader and you will be given a unique identification number associated with your ad.</li>
                <li>If your ad is disapproved, we will attempt to contact you and explain why your ad was not approved. If you decline an ad before it's published, you won't be charged. Please note that there is no contract between you and us until we have sent you a confirmation email.</li>
                <li>If you purchase a for sale advertiser package, your ad will run for a period of time. At the end of the period, you are entitled to re-book your ad for an additional free or extra of charge, as many times as you want until the car is sold.</li>
                <li>If you notify us that your vehicle has not been sold, we will re-book your advert for free.</li>
                <li>If we do not hear back from you, we will contact you via email after the period has expired. If we don't hear back from you, we'll assume you don't want to rebook or delete your ad. If we remove your ads in accordance with the terms of this clause, a hold will occur and you will not be able to rebook ads within the advertiser's bundle for free until the sale has ended. If you rebook an ad, you will be charged after the ad is removed.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Ad Content Guidelines</h3>
            <div className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Each ad can only contain one vehicle.</li>
                <li>Only one ad can be shown per car at a time.</li>
                <li>Images and videos must comply with all applicable laws and regulations.</li>
                <li>Content must not contain obscene or inappropriate material.</li>
                <li>Ads must be in English only.</li>
                <li>No spam or irrelevant content is permitted.</li>
                <li>Do not contain in any way discriminate or promote discrimination of any kind and not be pornographic or violent.</li>
                <li>Not disclose any personal information about any individual.</li>
                <li>Do not impersonate another person or misrepresent your identity or affiliation with a person or company.</li>
                <li>It is not illegal or solicit any third party to perform or assist in any illegal or criminal activity.</li>
                <li>The advertisement must not contain statements that directly or indirectly encourage or encourage commissioning, preparing or assisting in the commission of terrorist acts.</li>
                <li>Any advertisement or promotion of goods or services must be related to the sale of the vehicle targeted by your advertisement.</li>
                <li>The advertisement must not contain any spam.</li>
                <li>Ads must not contain text or audio unrelated to the advertisement described.</li>
                <li>The advertisement must not be in any language other than English.</li>
                <li>The advertisement must not be irrelevant or off-topic.</li>
                <li>It must not contain URLs or links to sites other than the advertiser's site.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Charges and Payment</h3>
            <div className="space-y-4">
              <p>The cost of advertising on GBTrader depends on the advertising package you choose and all prices are listed on GBTrader. All prices include consumption tax.</p>
              <p>Payment for adverts is made through online through GBTrader website.</p>
              <p>Payments can be made using Visa, MasterCard or Maestro. The card used for payment must be registered in the UK to be accepted.</p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Data Protection and Security</h3>
            <div className="space-y-4">
              <p>We take security very seriously and the GBTrader website offers advice on steps you can take to ensure your safety when selling your listing.</p>
              <p>By submitting an advertisement to us, you are requesting that the advertisement be displayed on GBTrader. This means that anyone in the world with access to the Internet can see ads and any information they contain.</p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Trade Advertising</h3>
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

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 