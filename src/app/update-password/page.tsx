import { PublicLayout } from "@/features/landing/components/PublicLayout";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";
import { getPublicProfessorProfile } from "@/features/landing/utils/get-public-profile";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  const { isAuthenticated } = await getPublicProfessorProfile();

  return (
    <PublicLayout isAuthenticated={isAuthenticated} maxWidth="4xl">
      <div className="flex items-center justify-center py-6">
        <UpdatePasswordForm />
      </div>
    </PublicLayout>
  );
}
