// Delt af chat-bubble.jsx og consent-manager.jsx (begge er fixed-positionerede
// flydende knapper/widgets, der ikke selv "ved" hvad der er under dem på
// siden). De skal aldrig dække over et par klart problematiske ting —
// bannere der bevidst er mærket til at skulle undgås (data-sm-bubble-avoid),
// og lydafspilleren (en vigtig, tilgængeligheds-kritisk knap) — uden ellers
// at blande sig i almindeligt sideindhold.
//
// Der har tidligere været et bredere "spørg DOM'en om der overhovedet er
// noget som helst herunder"-tjek (punkt-sampling + nedstigning gennem
// DOM-træet, elementsFromPoint). Det ramte for bredt: på knap-tunge sider
// (de fleste medicin-sider) fandt det ALTID en knap eller tekst et sted
// under boblen, så den reelt aldrig viste sig — brugeren oplevede det som
// at boblen "ikke opfører sig som før" (poppede ikke pålideligt frem, blev
// ikke ved med at vise sig når man scrollede). Det brede tjek er fjernet
// igen; kun de to konkret bekræftede, berettigede tilfælde undgås nu.
export function collidesWithProtectedElement(floatingEl) {
  if (!floatingEl) return false;
  try {
    const rect = floatingEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const targets = document.querySelectorAll('[data-sm-bubble-avoid="true"], audio');
    for (const target of targets) {
      const tRect = target.getBoundingClientRect();
      if (tRect.width === 0 || tRect.height === 0) continue;
      const overlaps = rect.left < tRect.right && rect.right > tRect.left && rect.top < tRect.bottom && rect.bottom > tRect.top;
      if (overlaps) return true;
    }
  } catch (e) {}
  return false;
}

// Venter til ms millisekunder er gået siden SIDSTE kald, før funktionen
// rent faktisk køres — kollisions-tjekket er for tungt til at køre direkte
// på hvert scroll-event, som på mobil kan fyre afsted mange gange i
// sekundet under selve bevægelsen og gav mærkbart lag. Debounce kører det
// først når scrollingen reelt er stoppet.
export function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
