export default function TopNav() {
  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm top-0 z-40 h-16 flex-shrink-0">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full">
        <div className="font-headline-md text-headline-md font-extrabold text-primary lg:hidden">
          Build My Business
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors">
          
        </div>

        <div className="flex items-center gap-4">
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

          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-container text-primary font-label-md text-label-md rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px]">magic_button</span>
            Ask AI
          </button>

          <div className="flex items-center gap-2">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="w-8 h-8 rounded-full overflow-hidden border-2 border-surface-container-highest hover:border-primary transition-colors focus:outline-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkaIG7VR9HQJOfxHlB7tjV4SfJP8LCnaZkFDK37lgrTPyGrf8gecG6K1F0Z-9YfOFwuBNn_9cGWYimeU4Z-CuCN4cG4L7eWAexEyyjigGIH6BrfX5GqVmPEeBA98e-X3RWHQ2uYkkq9rbSbM4tEBFmyJFI26Bhc3fBpfccCI9RA65G9GDRVsqS-V89IyjJQqgNcBiXMs5ePx0wa-hsID61W_9a2viEoZzS0RLuSUNHClRClQl1oKXF0Q"
                alt="Avatar utilisateur"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
