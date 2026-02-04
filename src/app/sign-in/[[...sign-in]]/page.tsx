import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#141416] border border-[#2a2a30]",
          }
        }}
      />
    </div>
  );
}

