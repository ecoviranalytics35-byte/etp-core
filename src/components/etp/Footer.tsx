export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <p>
          Powered by{" "}
          <span className="font-display font-semibold text-foreground">Ecovira Global</span> 🌍
        </p>
        <p>© {year} Ecovira Global. All rights reserved.</p>
      </div>
    </footer>
  );
}
