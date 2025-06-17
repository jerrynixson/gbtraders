"use client"
import { BillingPage } from "@/components/billing/billing-page";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Billing() {
  return (
    <>
      <Header />
      <main>
        <BillingPage />
      </main>
      <Footer />
    </>
  );
} 