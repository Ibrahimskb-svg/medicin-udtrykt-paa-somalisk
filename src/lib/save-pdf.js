// Genererer en rigtig, downloadbar PDF-fil af noget HTML-indhold — uden at gå
// via browserens print-dialog. Renderer indholdet skjult i dokumentet, tager
// et "skærmbillede" af det (html2canvas) og lægger det ind i en PDF (jsPDF),
// opdelt i A4-sider hvis indholdet er højere end én side.
//
// Elementer med class="pdf-block" bliver aldrig skåret midt over ved en
// sidevending — hvis en blok ikke er nok plads på den aktuelle side, skubbes
// den i sin helhed ned til næste side (samme teknik som "avoid page break
// inside element", bare lavet manuelt fordi indholdet rasteriseres som ét billede).
export async function saveHtmlAsPdf(html, filename) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "700px";
  container.style.background = "#ffffff";
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    // Vent til alle billeder (fx QR-koden) reelt er indlæst og dekodet, ellers
    // kan html2canvas nå at tage "billedet" af siden, før QR-koden er tegnet.
    const images = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        }).then(() => (img.decode ? img.decode().catch(() => {}) : null));
      })
    );

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidthPt = pdf.internal.pageSize.getWidth();
    const pageHeightPt = pdf.internal.pageSize.getHeight();

    const blocks = Array.from(container.querySelectorAll(".pdf-block"));
    if (blocks.length > 0) {
      const pxPerPage = (pageHeightPt * container.offsetWidth) / pageWidthPt;
      let pageBottom = pxPerPage;
      for (const block of blocks) {
        const top = block.offsetTop;
        const bottom = top + block.offsetHeight;
        if (bottom <= pageBottom) continue;
        if (top < pageBottom) {
          const spacer = document.createElement("div");
          spacer.style.height = `${pageBottom - top}px`;
          block.parentNode.insertBefore(spacer, block);
        }
        pageBottom += pxPerPage;
        while (block.offsetTop + block.offsetHeight > pageBottom) {
          pageBottom += pxPerPage;
        }
      }
    }

    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgWidth = pageWidthPt;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeightPt;

    while (heightLeft > 0) {
      position -= pageHeightPt;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeightPt;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
