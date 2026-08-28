import { weddingConfig } from "./config";

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL || "https://konecne-ano.cz";

// Odkazy — případné budoucí změny stačí měnit tady.
const GUEST_PHOTO_UPLOAD_URL =
  "https://photos.app.goo.gl/TEBkEwNNjxKaknT38"; // dosdílení fotek od hostů
const OFFICIAL_PHOTO_GALLERY_URL =
  "https://slusar.smugmug.com/0-0-0-vse-dlia-insta-site/JITKA/n-gwPsV3"; // oficiální fotogalerie

export type ThankYouVariant = "thanks" | "photos";

export const VARIANT_META: Record<
  ThankYouVariant,
  { title: string; description: string }
> = {
  thanks: {
    title: "Poděkování",
    description:
      "Obecné poděkování hostům + prosba o nasdílení fotek, které nafotili sami.",
  },
  photos: {
    title: "Fotografie",
    description:
      "Rozeslání odkazu na oficiální galerii od fotografa (barevná i černobílá varianta).",
  },
};

/**
 * Děkovný / follow-up email po svatbě.
 * Text je pro všechny stejný — bez oslovování jménem.
 *
 * - variant "thanks" : původní poděkování + CTA na Google Photos album
 *   (kam mohou hosté nahrát vlastní fotky)
 * - variant "photos" : follow-up s odkazem na oficiální fotogalerii
 */
export function buildThankYouEmail(
  variant: ThankYouVariant = "thanks",
): { subject: string; html: string; text: string } {
  if (variant === "photos") return buildPhotosEmail();
  return buildThanksEmail();
}

// ============================================================
// Varianta 1: Poděkování + prosba o sdílení fotek od hostů
// ============================================================
function buildThanksEmail(): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Ohlédnutí za naší svatbou · ${weddingConfig.couple}`;
  const greeting = `Milí svatebčané,`;

  const bodyParagraphs: string[] = [
    `chtěli bychom vám moc poděkovat za čas, který jste s námi strávili, a za to, že jste byli součástí našeho svatebního dne. My jsme si celý víkend opravdu užili a doufáme, že vy také.`,
    `Velmi si vážíme vašeho času, energie a pomoci při přípravách. Děkujeme také za vaše štědré dary, díky kterým pro nás organizace svatby nebyla tak finančně náročná.`,
    `Zvláštní poděkování patří všem, kteří se do příprav a samotného průběhu víkendu zapojili předem i na místě, pečením sladkostí, rozvozy, nákupy, vařením, výzdobou nebo organizací. Byli jsme příjemně překvapeni, jak si každý dokázal najít to, v čem je dobrý a výrazně přispět k tomu, že celý víkend krásně fungoval.`,
    `Ještě jednou vám všem mnohokrát děkujeme. Jsme moc rádi, že vás máme, a u nás máte vždy otevřené dveře.`,
  ];

  const introBeforeCta = `Čekáme ještě na oficiální fotografie od fotografa, o které se s vámi rádi podělíme. Jak už to na svatbách bývá, ve svatební den jsme ani jeden nefotili, takže sami nemáme žádné momentky z celého dne. Budeme proto moc vděční, pokud s námi nasdílíte své fotografie:`;

  const closingLine = `Děkujeme!`;

  return renderEmail({
    subject,
    greeting,
    bodyParagraphs,
    ctaIntro: introBeforeCta,
    ctaLabel: "📸 Sdílet fotografie",
    ctaUrl: GUEST_PHOTO_UPLOAD_URL,
    ctaHelperText: "Nebo zkopírujte tento odkaz:",
    closingLine,
    footerNote: "Poděkování za naši svatbu.",
  });
}

// ============================================================
// Varianta 2: Fotografie od fotografa — follow-up
// ============================================================
function buildPhotosEmail(): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Fotografie z naší svatby · ${weddingConfig.couple}`;
  const greeting = `Milí svatebčané,`;

  const bodyParagraphs: string[] = [
    `jak jsme vám minule slíbili, posíláme vám fotky z naší svatby.`,
    `Jelikož je fotografií opravdu hodně a originální soubory mají velkou velikost, pokud budete chtít konkrétní fotografie, na kterých jste vy, dejte nám prosím vědět, o které přesně se jedná. Rádi vám je zašleme individuálně v plné kvalitě.`,
    `Všechny fotografie jsou k dispozici v barevné i černobílé variantě, takže si můžete vybrat podle svého.`,
  ];

  const introBeforeCta = `Odkaz na galerii:`;
  const closingLine = `Děkujeme a budeme se těšit, až se nám ozvete!`;

  return renderEmail({
    subject,
    greeting,
    bodyParagraphs,
    ctaIntro: introBeforeCta,
    ctaLabel: "📷 Otevřít fotogalerii",
    ctaUrl: OFFICIAL_PHOTO_GALLERY_URL,
    ctaHelperText: "Nebo zkopírujte tento odkaz:",
    closingLine,
    footerNote: "Fotografie z naší svatby.",
  });
}

// ============================================================
// Shared renderer
// ============================================================
function renderEmail(o: {
  subject: string;
  greeting: string;
  bodyParagraphs: string[];
  ctaIntro: string;
  ctaLabel: string;
  ctaUrl: string;
  ctaHelperText: string;
  closingLine: string;
  footerNote: string;
}): { subject: string; html: string; text: string } {
  const headerImg = `${PUBLIC_BASE_URL}/header.png`;
  const footerImg = `${PUBLIC_BASE_URL}/patka.png`;

  const html = `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${escapeHtml(o.subject)}</title>
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
                <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#3d3833;">${o.greeting}</p>
                ${o.bodyParagraphs
                  .map(
                    (p) =>
                      `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.65;color:#3d3833;">${p}</p>`,
                  )
                  .join("\n")}
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.65;color:#3d3833;">${o.ctaIntro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px;text-align:center;">
                <a href="${o.ctaUrl}" style="display:inline-block;background-color:#87a396;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;">${o.ctaLabel}</a>
                <p style="margin:8px 0 0 0;font-size:11px;color:#9a928a;">
                  ${o.ctaHelperText}<br/>
                  <a href="${o.ctaUrl}" style="color:#87a396;">${o.ctaUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 24px;">
                <p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:#3d3833;">${o.closingLine}</p>
                <p style="margin:0;font-size:16px;line-height:1.6;color:#3d3833;font-style:italic;">${escapeHtml(weddingConfig.couple)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0;text-align:center;background-color:#ffffff;">
                <img src="${footerImg}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;"/>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 24px;text-align:center;font-size:12px;color:#9a928a;">
                ${escapeHtml(o.footerNote)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    o.greeting,
    ``,
    ...o.bodyParagraphs.flatMap((p) => [p, ``]),
    o.ctaIntro,
    ``,
    o.ctaUrl,
    ``,
    o.closingLine,
    weddingConfig.couple,
  ].join("\n");

  return { subject: o.subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
