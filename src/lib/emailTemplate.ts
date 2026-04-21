import { weddingConfig } from "./config";

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL || "https://konecne-ano.cz";

export function buildConfirmationEmail(guestName: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Potvrzení účasti — ${weddingConfig.couple}`;

  const headerImg = `${PUBLIC_BASE_URL}/header.png`;
  const footerImg = `${PUBLIC_BASE_URL}/patka.png`;

  const paragraphs = [
    `Milý/á ${escapeHtml(guestName)},`,
    `děkujeme za potvrzení účasti na naší svatbě! 💍`,
    `Naše svatba se uskuteční v <strong>Resortu Počepice</strong> (Počepice 22). Obřad proběhne <strong>15. srpna ve 14:00</strong>.`,
    `Budeme ale moc rádi, pokud s námi strávíte celý víkend v klidné a příjemné atmosféře <strong>od 14. do 16. srpna</strong>. Máme zarezervovaný celý dům jen pro nás, takže si to společně můžeme opravdu užít.`,
    `Věcné dary nejsou potřeba, vše už máme. Největší radost nám udělá, když přispějete na naši svatební cestu nebo na společné bydlení.`,
    `<strong>Dress code:</strong> společenské oblečení ve stylu svatební garden party. Prosíme dámy, aby zvolily jinou barvu než bílou – ta bude patřit nevěstě. 👰`,
    `Těšíme se na vás!`,
    `— ${escapeHtml(weddingConfig.couple)}`,
  ];

  const html = `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#faf7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#3d3833;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:0;text-align:center;background-color:#ffffff;">
                <img src="${headerImg}" alt="Jitka &amp; Martin" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" />
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 16px;">
                ${paragraphs
                  .map(
                    (p) =>
                      `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#3d3833;">${p}</p>`,
                  )
                  .join("\n")}
              </td>
            </tr>
            <tr>
              <td style="padding:0;text-align:center;background-color:#ffffff;">
                <img src="${footerImg}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" />
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 24px;text-align:center;font-size:12px;color:#9a928a;">
                Tento email jsi dostal/a, protože jsi potvrdil/a účast na svatbě.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Milý/á ${guestName},`,
    ``,
    `děkujeme za potvrzení účasti na naší svatbě!`,
    ``,
    `Naše svatba se uskuteční v Resortu Počepice (Počepice 22).`,
    `Obřad proběhne 15. srpna ve 14:00.`,
    ``,
    `Budeme ale moc rádi, pokud s námi strávíte celý víkend v klidné a příjemné atmosféře od 14. do 16. srpna. Máme zarezervovaný celý dům jen pro nás, takže si to společně můžeme opravdu užít.`,
    ``,
    `Věcné dary nejsou potřeba, vše už máme. Největší radost nám udělá, když přispějete na naši svatební cestu nebo na společné bydlení.`,
    ``,
    `Dress code: společenské oblečení ve stylu svatební garden party.`,
    `Prosíme dámy, aby zvolily jinou barvu než bílou – ta bude patřit nevěstě.`,
    ``,
    `Těšíme se na vás!`,
    `— ${weddingConfig.couple}`,
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
