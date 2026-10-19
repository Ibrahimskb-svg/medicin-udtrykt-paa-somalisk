// Delt af chat-bubble.jsx og consent-manager.jsx (begge er fixed-positionerede
// flydende knapper/widgets, der ikke selv "ved" hvad der er under dem på
// siden). Elementer markeret med data-sm-bubble-avoid="true" (bannere på
// forsiden) samt lydafspilleren (der popper op og kan ligge lige under en
// flydende knap) skal aldrig dækkes — ellers blokerer den flydende knap for
// tryk på vigtigt indhold.
export function collidesWithProtectedElement(floatingEl) {
  if (!floatingEl) return false;
  try {
    const floatingRect = floatingEl.getBoundingClientRect();
    const targets = document.querySelectorAll('[data-sm-bubble-avoid="true"], audio');
    for (const el of targets) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const overlaps =
        floatingRect.left < rect.right &&
        floatingRect.right > rect.left &&
        floatingRect.top < rect.bottom &&
        floatingRect.bottom > rect.top;
      if (overlaps) return true;
    }
  } catch (e) {}
  return false;
}
