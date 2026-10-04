import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center px-6 text-center">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative">
        <p className="font-serif text-gold text-8xl font-semibold mb-4">404</p>
        <div className="gold-divider mb-6" />
        <h1 className="font-serif text-ivory text-2xl font-semibold mb-3">
          Page not found
        </h1>
        <p className="text-ivory/50 text-sm max-w-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-charcoal text-sm font-semibold rounded-sm hover:bg-gold-light transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
