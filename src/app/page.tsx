import RsvpForm from "./RsvpForm";
import { weddingConfig, formatDate } from "@/lib/config";

export default function Home() {
  return (
    <main className="min-h-screen bg-wedding-cream">
      <section className="relative overflow-hidden bg-gradient-to-b from-wedding-sage/15 to-transparent py-20 text-center">
        <p className="font-serif italic text-wedding-ink/70">Svatba</p>
        <h1 className="mt-2 font-serif text-5xl sm:text-6xl text-wedding-ink">
          {weddingConfig.couple}
        </h1>
        <p className="mt-4 text-lg text-wedding-ink/80">
          {formatDate(weddingConfig.date)} &middot; {weddingConfig.venue}
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-24">
        <div className="rounded-xl bg-white/80 p-6 sm:p-10 shadow-sm">
          <h2 className="font-serif text-3xl text-wedding-ink text-center">
            Potvrzení účasti
          </h2>
          <p className="mt-2 text-center text-wedding-ink/70">
            Prosíme, dejte nám vědět do <strong>31. května 2026</strong>.
          </p>

          <div className="mt-8">
            <RsvpForm />
          </div>
        </div>
      </section>
    </main>
  );
}
