// Delt af chat-bubble.jsx og consent-manager.jsx (begge er fixed-positionerede
// flydende knapper/widgets, der ikke selv "ved" hvad der er under dem på
// siden). De skal aldrig dække over rigtigt indhold — ellers blokerer den
// flydende knap for tryk på eller læsning af noget vigtigt.
//
// Tidligere tjekkede denne kun eksplicit mærkede elementer
// (data-sm-bubble-avoid="true") og <audio> — men en visuel gennemgang på
// dansk/engelsk viste at widgets'ene også kunne dække almindelige
// indholdskort (intro-teksten på medicin-sider, det første ordliste-opslag
// osv.), som aldrig var mærket, fordi den slags indhold flytter sig
// forskelligt alt efter sprogets tekstlængde. Et punkt-sampling-tjek, der
// spørger DOM'en "hvad er der egentlig her?", generaliserer til alt indhold
// uden at skulle mærke hvert enkelt element manuelt.
const TEXTUAL_TAGS = new Set(["A", "BUTTON", "P", "SPAN", "H1", "H2", "H3", "H4", "H5", "LI", "LABEL", "INPUT", "TEXTAREA", "SELECT", "AUDIO", "STRONG", "EM", "B"]);

function hasOwnText(node) {
  for (const child of node.childNodes) {
    if (child.nodeType === 3 && child.textContent.trim().length > 0) return true;
  }
  return false;
}

// `behind` is often a big container (a whole card <section>, not the <p>
// inside it) — its .textContent aggregates ALL descendant text wherever it
// is on the page, which says nothing about this specific pixel. So instead
// of trusting that, descend through whichever child's own box actually
// covers (x, y) until we reach the real leaf rendered at that exact point.
function descendToPoint(el, x, y, maxDepth = 6) {
  let node = el;
  for (let i = 0; i < maxDepth; i++) {
    if (node.getAttribute && node.getAttribute("aria-hidden") === "true") return null;
    const child = Array.from(node.children).find((c) => {
      const r = c.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && r.width > 0 && r.height > 0;
    });
    if (!child) return node;
    node = child;
  }
  return node;
}

function pointHasRealContent(x, y, floatingEl) {
  // elementFromPoint only ever returns the TOPMOST element — which, right
  // at this coordinate, is always the floating widget itself (it has the
  // highest z-index here). elementsFromPoint returns the full stack in
  // z-order, so we can skip past the widget's own elements and inspect
  // whatever is actually rendered behind it.
  const stack = typeof document.elementsFromPoint === "function" ? document.elementsFromPoint(x, y) : [document.elementFromPoint(x, y)];
  const behind = stack.find((el) => el && !(floatingEl && floatingEl.contains(el)));
  if (!behind) return false;
  const leaf = descendToPoint(behind, x, y);
  if (!leaf) return false;
  if (TEXTUAL_TAGS.has(leaf.tagName)) return true;
  if (hasOwnText(leaf)) return true;
  if (leaf.children.length === 0 && (leaf.textContent || "").trim().length > 0) return true;
  return false;
}

// Venter til ms millisekunder er gået siden SIDSTE kald, før funktionen
// rent faktisk køres — kollisions-tjekket (elementsFromPoint + at gå ned
// igennem DOM-træet for hvert prøvepunkt, inkl. getBoundingClientRect på
// hvert niveau) er for tungt til at køre mens man aktivt scroller: selv
// throttling til fx hver 200ms ville stadig udløse tjekket flere gange
// UNDER selve scroll-bevægelsen og give mærkbare mikro-stop. Debounce kører
// det først når scrollingen reelt er stoppet, så der aldrig sker noget
// tungt midt i en scroll — setInterval'et i hver forbruger dækker allerede
// den løbende baggrundskontrol, så dette skal kun give et hurtigt resultat
// lige efter man er stoppet med at scrolle/resize'e.
export function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function collidesWithProtectedElement(floatingEl) {
  if (!floatingEl) return false;
  try {
    const rect = floatingEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const points = [
      [rect.left + 2, rect.top + 2],
      [rect.right - 2, rect.top + 2],
      [rect.left + 2, rect.bottom - 2],
      [rect.right - 2, rect.bottom - 2],
      [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2],
    ];
    for (const [x, y] of points) {
      if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
      if (pointHasRealContent(x, y, floatingEl)) return true;
    }
    // Eksplicit mærkede elementer undgås altid, uanset om et prøvepunkt
    // rammer dem — en sikkerhedsnet for indhold der bevidst er mærket.
    const tagged = document.querySelectorAll('[data-sm-bubble-avoid="true"]');
    for (const target of tagged) {
      const tRect = target.getBoundingClientRect();
      if (tRect.width === 0 || tRect.height === 0) continue;
      const overlaps = rect.left < tRect.right && rect.right > tRect.left && rect.top < tRect.bottom && rect.bottom > tRect.top;
      if (overlaps) return true;
    }
  } catch (e) {}
  return false;
}
