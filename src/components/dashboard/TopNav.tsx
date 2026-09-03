import Button from "@/components/ui/Button";

export default function TopNav() {
  return (
    <header className="top-0 z-40 h-16 flex-shrink-0 border-b border-outline-variant/70 bg-surface/95 shadow-[0_4px_16px_rgba(27,27,35,0.04)] backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full">
        <div className="font-headline-md text-headline-md font-extrabold text-primary lg:hidden">
          Build My Business
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-full text-body-sm font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
            />
          </div>

          <Button variant="secondary" size="sm" className="hidden md:inline-flex">
            <span className="material-symbols-outlined text-[18px]">magic_button</span>
            Demander à l&apos;IA
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="icon" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error" />
            </Button>
            <Button
              variant="icon"
              size="sm"
              aria-label="Menu du compte"
              className="overflow-hidden border-2 border-surface-container-highest hover:border-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkaIG7VR9HQJOfxHlB7tjV4SfJP8LCnaZkFDK37lgrTPyGrf8gecG6K1F0Z-9YfOFwuBNn_9cGWYimeU4Z-CuCN4cG4L7eWAexEyyjigGIH6BrfX5GqVmPEeBA98e-X3RWHQ2uYkkq9rbSbM4tEBFmyJFI26Bhc3fBpfccCI9RA65G9GDRVsqS-V89IyjJQqgNcBiXMs5ePx0wa-hsID61W_9a2viEoZzS0RLuSUNHClRClQl1oKXF0Q"
                alt="Avatar utilisateur"
                className="h-full w-full object-cover"
              />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
