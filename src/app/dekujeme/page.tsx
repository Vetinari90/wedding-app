import Link from "next/link";
import { weddingConfig } from "@/lib/config";

export default function ThankYou() {
  return (
    <main className="min-h-screen bg-wedding-cream flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="font-serif text-5xl text-wedding-ink">Děkujeme!</h1>
        <p className="mt-6 text-lg text-wedding-ink/80">
          Vaše odpověď byla zaznamenána. Těšíme se na vás.
        </p>
        <p className="mt-2 text-wedding-ink/60">— {weddingConfig.couple}</p>
        <Link
          href="/"
          className="mt-10 inline-block text-wedding-sage hover:underline"
        >
          Zpět na úvod
        </Link>
      </div>
    </main>
  );
}
