import { weddingConfig } from "./config";

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL || "https://konecne-ano.cz";

const PHOTOS_URL = "https://photos.app.goo.gl/TEBkEwNNjxKaknT38";

/**
 * Děkovný email po svatbě. Stejný text pro všechny — bez personalizace,
 * bez ohledu na typ pobytu, bez oslovování jménem.
 */
export function buildThankYouEmail(): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Ohlédnutí za naší svatbou · ${weddingConfig.couple}`;

  const headerImg = `${PUBLIC_BASE_URL}/header.png`;
  const footerImg = `${PUBLIC_BASE_URL}/patka.png`;

  const greeting = `Milí svatebčané,`;

  const bodyParagraphs: string[] = [
    `chtěli bychom vám moc poděkovat za čas, který jste s námi strávili, a za to, že jste byli součástí našeho svatebního dne. My jsme si celý víkend opravdu užili a doufáme, že vy také.`,
    `Velmi si vážíme vašeho času, energie a pomoci při přípravách. Děkujeme také za vaše štědré dary, díky kterým pro nás organizace svatby nebyla tak finančně náročná.`,
    `Zvláštní poděkování patří všem, kteří se do příprav a samotného průběhu víkendu zapojili předem i na místě, pečením sladkostí, rozvozy, nákupy, vařením, výzdobou nebo organizací. Byli jsme příjemně překvapeni, jak si každý dokázal najít to, v čem je dobrý a výrazně přispět k tomu, že celý víkend krásně fungoval.`,
    `Ještě jednou vám všem mnohokrát děkujeme. Jsme moc rádi, že vás máme, a u nás máte vždy otevřené dveře.`,
  ];

  const photosIntro = `Čekáme ještě na oficiální fotografie od fotografa, o které se s vámi rádi podělíme. Jak už to na svatbách bývá, ve svatební den jsme ani jeden nefotili, takže sami nemáme žádné momentky z celého dne. Budeme proto moc vděční, pokud s námi nasdílíte své fotografie:`;

  const closing = `Děkujeme!`;
  const signoff = escapeHtml(weddingConfig.couple);

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
                <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#3d3833;">${greeting}</p>
                ${bodyParagraphs
                  .map(
                    (p) =>
                      `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.65;color:#3d3833;">${p}</p>`,
                  )
                  .join("\n")}
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.65;color:#3d3833;">${photosIntro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px;text-align:center;">
                <a href="${PHOTOS_URL}" style="display:inline-block;background-color:#87a396;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;">📸 Sdílet fotografie</a>
                <p style="margin:8px 0 0 0;font-size:11px;color:#9a928a;">
                  Nebo zkopírujte tento odkaz:<br/>
                  <a href="${PHOTOS_URL}" style="color:#87a396;">${PHOTOS_URL}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 24px;">
                <p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:#3d3833;">${closing}</p>
                <p style="margin:0;font-size:16px;line-height:1.6;color:#3d3833;font-style:italic;">${signoff}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0;text-align:center;background-color:#ffffff;">
                <img src="${footerImg}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;"/>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 24px;text-align:center;font-size:12px;color:#9a928a;">
                Poděkování za naši svatbu.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    greeting,
    ``,
    ...bodyParagraphs.flatMap((p) => [p, ``]),
    photosIntro,
    ``,
    `Odkaz na sdílení fotografií: ${PHOTOS_URL}`,
    ``,
    closing,
    weddingConfig.couple,
  ].join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
