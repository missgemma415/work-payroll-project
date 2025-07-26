import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-warm-lg border-warmth-200 bg-white/90 backdrop-blur",
            headerTitle: "font-display text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border-warmth-200 hover:bg-warmth-50 transition-colors",
            formFieldInput: "border-warmth-200 focus:border-primary",
            footerActionLink: "text-primary hover:text-primary/80",
          }
        }}
      />
    </div>
  );
}