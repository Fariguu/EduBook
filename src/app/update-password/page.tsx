import { PublicNavbar } from "@/features/landing/components/PublicNavbar";
import { Footer } from "@/features/landing/components/Footer";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <UpdatePasswordForm />
      </main>
      <Footer />
    </div>
  );
}
