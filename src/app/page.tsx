import RsvpForm from "./RsvpForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-wedding-cream">
      {/* Pozvánka — hero obrázek */}
      <section className="px-4 pt-8 pb-4 sm:pt-14 flex justify-center">
        <img
          src="/pozvanka.png"
          alt="Svatební pozvánka Jitka & Martin"
          className="w-full max-w-[560px] h-auto rounded-lg shadow-[0_8px_40px_-8px_rgba(61,56,51,0.25)]"
        />
      </section>

      {/* Informační text */}
      <section className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="space-y-5 text-[17px] leading-[1.75] text-wedding-ink">
          <p>
            Naše svatba se uskuteční v <strong>Resortu Počepice</strong>{" "}
            (Počepice 22). Obřad proběhne <strong>15. srpna ve 14:00</strong>.
          </p>

          <p>
            Pokud s námi plánujete strávit celý svatební víkend, můžete
            přijet už v <strong>pátek od 10:00</strong>. Máme zarezervovaný
            celý dům jen pro nás, takže si to společně můžeme opravdu užít.
            Budeme rádi za každou pomoc i společnost při přípravách.
          </p>

          <p>
            Ubytování vám rádi zajistíme, pokud o něj budete mít zájem.
            Počítejte prosím s tím, že většina pokojů bude sdílená, zatímco
            samostatné pokoje budou vyhrazeny pro nejbližší rodinu.
          </p>

          <div className="rounded-lg border border-wedding-sage/30 bg-white/50 p-5">
            <p className="font-medium text-wedding-ink">Dary</p>
            <p className="mt-2">
              Věcné dary nejsou potřeba, vše už máme. Největší radost nám udělá,
              když přispějete na naši svatební cestu nebo na společné bydlení.
            </p>
          </div>

          <div className="rounded-lg border border-wedding-sage/30 bg-white/50 p-5">
            <p className="font-medium text-wedding-ink">Dress code</p>
            <p className="mt-2">
              Společenské oblečení ve stylu svatební garden party. Prosíme
              dámy, aby zvolily jinou barvu než bílou — ta bude patřit nevěstě.
            </p>
          </div>

          <p className="text-center italic text-wedding-ink/80 pt-2">
            Prosíme, potvrďte účast ve formuláři, abychom věděli, s kolika
            lidmi počítat.
          </p>
        </div>
      </section>

      {/* Formulář */}
      <section className="mx-auto max-w-2xl px-4 pb-24">
        <div className="rounded-xl bg-white/80 p-6 sm:p-10 shadow-sm">
          <h2 className="font-serif text-3xl text-wedding-ink text-center">
            Potvrzení účasti
          </h2>
          <p className="mt-2 text-center text-wedding-ink/70">
            Prosíme, dejte nám vědět do <strong>15. června 2026</strong>.
          </p>

          <div className="mt-8">
            <RsvpForm />
          </div>
        </div>
      </section>
    </main>
  );
}
