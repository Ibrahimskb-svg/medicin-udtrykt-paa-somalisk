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
  localStorage.setItem(KEY, JSON.stringify(next));
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

export function subscribeMyList(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(MY_LIST_EVENT, handler);
  return () => window.removeEventListener(MY_LIST_EVENT, handler);
}
