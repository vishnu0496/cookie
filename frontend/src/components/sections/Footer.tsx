export function Footer() {
  return (
    <footer className="bg-forest text-cream/60 py-12 px-6 text-sm font-sans flex flex-col items-center border-t border-cream/5">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="tracking-widest uppercase text-xs">© {new Date().getFullYear()} Sundays Hyderabad</p>
          <p className="font-serif italic text-cream/30 text-xs">Baked every Sunday · Hyderabad</p>
        </div>

        <div className="flex gap-8">
          <a
            href="https://instagram.com/sundays.hyd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors"
          >
            Instagram
          </a>
          <a
            href="mailto:sundayshyd@gmail.com"
            className="hover:text-gold transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
