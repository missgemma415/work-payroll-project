export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warmth-gradient">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-community-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="font-display font-bold text-2xl text-foreground">
              Scientia Capital
            </span>
          </div>
          <p className="text-muted-foreground">
            Welcome to your work home 🏡
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}