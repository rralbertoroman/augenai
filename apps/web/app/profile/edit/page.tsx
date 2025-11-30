import { ProfileEditForm } from "@/components/profile-edit-form";

export default function ProfileEditPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Editar Perfil</h1>
        <ProfileEditForm />
      </div>
    </div>
  );
}
