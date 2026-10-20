const KEY = "somalimed_my_list";
export const MY_LIST_EVENT = "somalimed-mylist-change";

export function getMyList() {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function save(next) {
  // Hvis localStorage kaster (Safari "Bloker alle cookies", fuld
  // storage-kvote osv.) skal "tilføj/fjern"-knapperne stadig virke for
  // resten af denne side-visning — kun selve det at det gemmes til næste
  // besøg går tabt, i stedet for at hele handlingen stille fejler uden
  // nogen reaktion i UI'en overhovedet.
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent(MY_LIST_EVENT, { detail: next }));
  return next;
}

export function addToMyList(slug) {
  const list = getMyList();
  return list.includes(slug) ? list : save([...list, slug]);
}

export function removeFromMyList(slug) {
  return save(getMyList().filter((s) => s !== slug));
}

export function toggleMyList(slug) {
  return getMyList().includes(slug) ? removeFromMyList(slug) : addToMyList(slug);
}

// Lægger en delt liste (fra et ?list=-link) oven i brugerens egen —
// erstatter IKKE, så man ikke mister medicin man allerede havde tilføjet.
export function mergeIntoMyList(slugs) {
  const list = getMyList();
  const merged = Array.from(new Set([...list, ...slugs]));
  return save(merged);
}

export function subscribeMyList(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(MY_LIST_EVENT, handler);
  return () => window.removeEventListener(MY_LIST_EVENT, handler);
}
