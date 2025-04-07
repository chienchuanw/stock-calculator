import AuthForms from "@/components/auth/AuthForms";

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-md">
        <AuthForms />
      </div>
    </div>
  );
}
