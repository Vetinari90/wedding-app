import { weddingConfig } from "./config";

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL || "https://konecne-ano.cz";

/**
 * Which of the two reminder variants a guest gets is derived from their
 * `accommodation_stay`:
 *   "weekend"  → páteční varianta (přijedou už v pátek)
 *   "sat_sun"  → sobotní varianta, s poznámkou o ubytování
 *   "one_day"  → sobotní varianta, bez ubytovací poznámky
 *   null/other → sobotní varianta bez ubytování (default fallback)
 */
export type ReminderStay = "weekend" | "sat_sun" | "one_day" | null;

export function buildReminderEmail(
  guestName: string,
  stay: ReminderStay,
): { subject: string; html: string; text: string } {
  const subject = `Připomínka: svatba za 2 týdny · ${weddingConfig.couple}`;

  const headerImg = `${PUBLIC_BASE_URL}/header.png`;
  const footerImg = `${PUBLIC_BASE_URL}/patka.png`;

  const isFriday = stay === "weekend";
  const includeAccommodation = stay === "weekend" || stay === "sat_sun";

  const intro = `Milý/á ${escapeHtml(guestName)},`;

  const openingParagraph =
    `za dva týdny proběhne dlouho očekávaná svatba Jitky a Martina. ` +
    `Chceme ti dát pár praktických informací, ať máš vše po ruce.`;

  // Klíčová informace — bude ve zvýrazněném rámečku
  const arrivalHighlight = isFriday
    ? `Dům otevíráme <strong>v pátek ve 14:00</strong>, přijet můžeš kdykoli po této hodině. ` +
      `Dřívější příjezd bohužel není možný. Poté se pustíme do finálních příprav.`
    : `Obřad začíná <strong>v sobotu ve 14:00</strong>. ` +
      `Doporučujeme ti dorazit <strong>zhruba hodinu předem</strong>, ` +
      `ať se vyhneme svatebnímu shonu a máme čas se s tebou v klidu přivítat.`;

  const accommodationParagraph = includeAccommodation
    ? isFriday
      ? `Spaní pro tebe máme zajištěné, včetně <strong>povlečení a ručníků</strong>.`
      : `Pokud u nás zůstáváš do neděle, spaní máme zajištěné, včetně <strong>povlečení a ručníků</strong>.`
    : null;

  const sweetParagraph =
    `Budeme moc rádi, když přivezeš něco, co rád/a pečeš. Klidně sladké i slané.`;

  const dresscodeParagraph =
    `<strong>Dress code:</strong> společenské oblečení ve stylu svatební garden party. ` +
    `Na společných fotkách pak budeme všichni vypadat krásně.`;

  const addressParagraph =
    `<strong>Adresa:</strong> Resort Počepice, Počepice 22. ` +
    `Snadno se sem dostaneš autem (parkování na místě nebo v okolí vesnice), ` +
    `případně <strong>autobusem s přestupem v Sedlčanech</strong>.`;

  const helpParagraph = isFriday
    ? `V pátek se nám bude hodit každá ruka. Pokud budeš mít chuť pomoct s výzdobou nebo přípravami, ` +
      `budeme moc rádi. Předem děkujeme za každou pomoc i společnost.`
    : null;

  const closingParagraph = isFriday
    ? `Ještě jednou ti moc děkujeme, že s námi strávíš celý svatební víkend. Těšíme se na tebe.`
    : `Ještě jednou ti moc děkujeme, že s námi tento den strávíš. Těšíme se na tebe.`;

  const signoff = escapeHtml(weddingConfig.couple);

  // Poskládat tělo (bez zvýrazněného rámečku, ten renderujeme zvlášť)
  const bodyParagraphs: string[] = [];
  if (accommodationParagraph) bodyParagraphs.push(accommodationParagraph);
  bodyParagraphs.push(sweetParagraph, dresscodeParagraph, addressParagraph);
  if (helpParagraph) bodyParagraphs.push(helpParagraph);

  const html = `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#faf7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#3d3833;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:0;text-align:center;background-color:#ffffff;">
                <img src="${headerImg}" alt="Jitka &amp; Martin" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;"/>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#3d3833;">${intro}</p>
                <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#3d3833;">${openingParagraph}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;">
                <div style="border:2px solid #87a396;border-radius:8px;padding:18px 22px;background-color:#eef3ef;">
                  <p style="margin:0;font-size:16px;line-height:1.55;color:#3d3833;">${arrivalHighlight}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 8px;">
                ${bodyParagraphs
                  .map(
                    (p) =>
                      `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#3d3833;">${p}</p>`,
                  )
                  .join("\n")}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 24px;">
                <p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:#3d3833;">${closingParagraph}</p>
                <p style="margin:0;font-size:16px;line-height:1.6;color:#3d3833;">${signoff}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0;text-align:center;background-color:#ffffff;">
                <img src="${footerImg}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;"/>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 24px;text-align:center;font-size:12px;color:#9a928a;">
                Připomínkový email k naší svatbě.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  // Plain-text verze
  const textLines: string[] = [
    `Milý/á ${guestName},`,
    ``,
    `za dva týdny proběhne dlouho očekávaná svatba Jitky a Martina. Chceme ti dát pár praktických informací, ať máš vše po ruce.`,
    ``,
  ];
  if (isFriday) {
    textLines.push(
      `Dům otevíráme v pátek ve 14:00, přijet můžeš kdykoli po této hodině. Dřívější příjezd bohužel není možný. Poté se pustíme do finálních příprav.`,
    );
  } else {
    textLines.push(
      `Obřad začíná v sobotu ve 14:00. Doporučujeme ti dorazit zhruba hodinu předem, ať se vyhneme svatebnímu shonu.`,
    );
  }
  textLines.push(``);
  if (accommodationParagraph) {
    textLines.push(
      isFriday
        ? `Spaní pro tebe máme zajištěné, včetně povlečení a ručníků.`
        : `Pokud u nás zůstáváš do neděle, spaní máme zajištěné, včetně povlečení a ručníků.`,
      ``,
    );
  }
  textLines.push(
    `Budeme moc rádi, když přivezeš něco, co rád/a pečeš. Klidně sladké i slané.`,
    ``,
    `Dress code: společenské oblečení ve stylu svatební garden party. Na společných fotkách pak budeme všichni vypadat krásně.`,
    ``,
    `Adresa: Resort Počepice, Počepice 22. Snadno se sem dostaneš autem, případně autobusem s přestupem v Sedlčanech.`,
    ``,
  );
  if (isFriday) {
    textLines.push(
      `V pátek se nám bude hodit každá ruka. Pokud budeš mít chuť pomoct s výzdobou nebo přípravami, budeme moc rádi. Předem děkujeme za každou pomoc i společnost.`,
      ``,
    );
  }
  textLines.push(
    isFriday
      ? `Ještě jednou ti moc děkujeme, že s námi strávíš celý svatební víkend. Těšíme se na tebe.`
      : `Ještě jednou ti moc děkujeme, že s námi tento den strávíš. Těšíme se na tebe.`,
    `${weddingConfig.couple}`,
  );

  return { subject, html, text: textLines.join("\n") };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
