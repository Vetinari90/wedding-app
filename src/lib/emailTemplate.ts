import { weddingConfig } from "./config";

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL || "https://konecne-ano.cz";

export function buildConfirmationEmail(
  guestName: string,
  stay: string | null = null,
): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Potvrzení účasti — ${weddingConfig.couple}`;

  const headerImg = `${PUBLIC_BASE_URL}/header.png`;
  const footerImg = `${PUBLIC_BASE_URL}/patka.png`;

  const intro = `Milý/á ${escapeHtml(guestName)},`;
  const thanks = `děkujeme ti za potvrzení účasti na naší svatbě! 💍`;

  // Personalizované poděkování podle zvoleného pobytu
  const stayThanks =
    stay === "weekend"
      ? `Moc se těšíme, že s námi strávíš celý svatební víkend.`
      : stay === "sat_sun"
        ? `Moc se těšíme, že s námi oslavíš náš velký den a zůstaneš až do neděle.`
        : null;

  // Odstavce závislé na zvoleném pobytu — vzájemně se vylučují.
  const fridayParagraph =
    stay === "weekend"
      ? `Můžeš přijet už v pátek od 10:00. Můžeš si užít procházku po okolí nebo se zapojit do příprav, budeme rádi za každou pomoc i společnost.`
      : null;
  const saturdayArrivalParagraph =
    stay === "sat_sun" || stay === "one_day"
      ? `Prosíme tě, abys dorazil/a na místo alespoň hodinu před obřadem (nejpozději do 13:00). Předejdeme tak zbytečnému svatebnímu shonu.`
      : null;

  const paragraphs: string[] = [];
  if (fridayParagraph) paragraphs.push(fridayParagraph);
  if (saturdayArrivalParagraph) paragraphs.push(saturdayArrivalParagraph);
  paragraphs.push(
    `Parkovat můžeš přímo na místě, ale přednostně ho chceme nechat pro dodavatele a nejbližší rodinu. Budeme rádi, když si najdeš místo k parkování někde po vesnici.`,
    `Do Počepic se dostaneš pohodlně i bez auta, jezdí sem autobusové spoje přes Sedlčany, takže cesta tam i zpět je dobře dostupná veřejnou dopravou.`,
  );

  const bullets = [
    `<strong>Místo:</strong> Resort Počepice (Počepice 22)`,
    `<strong>Obřad:</strong> 15. srpna ve 14:00`,
    `<strong>Možnost přijet na celý víkend:</strong> 14.–16. srpna`,
    `<strong>Ubytování:</strong> rezervovaný celý dům pouze pro nás`,
    `<strong>Dary:</strong> věcné nejsou potřeba (vše máme), potěší příspěvek na svatební cestu nebo bydlení`,
    `<strong>Dress code:</strong> společenský styl „svatební garden party“`,
    `Dámy prosíme nevolit bílou (vyhrazena pro nevěstu)`,
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
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#3d3833;">${intro}</p>
                <p style="margin:0 0 ${stayThanks ? "12" : "20"}px 0;font-size:16px;line-height:1.6;color:#3d3833;">${thanks}</p>
                ${
                  stayThanks
                    ? `<p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#3d3833;">${stayThanks}</p>`
                    : ""
                }
                ${paragraphs
                  .map(
                    (p) =>
                      `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#3d3833;">${p}</p>`,
                  )
                  .join("\n")}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 8px;">
                  ${bullets
                    .map(
                      (b) => `<tr>
                    <td style="border:1px solid #e5dccf;border-radius:8px;background-color:#faf7f2;padding:12px 16px;font-size:15px;line-height:1.5;color:#3d3833;">${b}</td>
                  </tr>`,
                    )
                    .join("\n")}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 24px;">
                <p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:#3d3833;">Těšíme se na vás!</p>
                <p style="margin:0;font-size:16px;line-height:1.6;color:#3d3833;">— ${escapeHtml(weddingConfig.couple)}</p>
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

  const textLines: string[] = [
    `Milý/á ${guestName},`,
    ``,
    `děkujeme ti za potvrzení účasti na naší svatbě!`,
  ];
  if (stayThanks) {
    textLines.push(``, stayThanks);
  }
  textLines.push(``);
  if (fridayParagraph) {
    textLines.push(fridayParagraph, ``);
  }
  if (saturdayArrivalParagraph) {
    textLines.push(saturdayArrivalParagraph, ``);
  }
  textLines.push(
    `Parkovat můžeš přímo na místě, ale přednostně ho chceme nechat pro dodavatele a nejbližší rodinu. Budeme rádi, když si najdeš místo k parkování někde po vesnici.`,
    ``,
    `Do Počepic se dostaneš pohodlně i bez auta, jezdí sem autobusové spoje přes Sedlčany, takže cesta tam i zpět je dobře dostupná veřejnou dopravou.`,
    ``,
    `- Místo: Resort Počepice (Počepice 22)`,
    `- Obřad: 15. srpna ve 14:00`,
    `- Možnost přijet na celý víkend: 14.–16. srpna`,
    `- Ubytování: rezervovaný celý dům pouze pro nás`,
    `- Dary: věcné nejsou potřeba (vše máme), potěší příspěvek na svatební cestu nebo bydlení`,
    `- Dress code: společenský styl „svatební garden party"`,
    `- Dámy prosíme nevolit bílou (vyhrazena pro nevěstu)`,
    ``,
    `Těšíme se na vás!`,
    `— ${weddingConfig.couple}`,
  );
  const text = textLines.join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
