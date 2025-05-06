"use client";

import { FireCMSApp } from "@firecms/firebase";
import { vehiclesCollection } from "@/lib/firecms-config";
import { auth, db, storage } from "@/lib/firebase";

export default function AdminPage() {
  return (
    <FireCMSApp
      name="GB Traders Admin"
      logo="/gbtrader-logo.png"
      collections={[vehiclesCollection]}
      firebaseConfig={{
        auth,
        db,
        storage
      }}
      signInOptions={[
        {
          provider: "password",
          email: true
        }
      ]}
      allowSkipLogin={false}
      primaryColor="#4F46E5"
      secondaryColor="#818CF8"
    />
  );
} 