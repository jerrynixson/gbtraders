import { ProfilePage } from "@/components/profile/profile-page";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Profile() {
  return (
    <>
      <Header />
      <main>
        <ProfilePage />
      </main>
      <Footer />
    </>
  );
} 