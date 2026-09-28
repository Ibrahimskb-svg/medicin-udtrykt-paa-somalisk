const KEY = "somalimed_dose_schedule";
export const DOSE_SCHEDULE_EVENT = "somalimed-doseschedule-change";

// Fire faste tider, samme opdeling som en dansk apoteks doseringsæske
// (morgen/middag/aften/nat) — ikke ugedage, da kronisk medicin normalt
// tages på samme tider hver dag.
export const TIME_SLOTS = ["morning", "noon", "evening", "night"];

export function getSchedule() {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function save(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(DOSE_SCHEDULE_EVENT, { detail: next }));
  return next;
}

export function toggleScheduleSlot(slug, slot) {
  const schedule = getSchedule();
  const current = schedule[slug] || [];
  const next = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot];
  return save({ ...schedule, [slug]: next });
}

// Ryd et medicins tider, når det fjernes fra "Min medicinliste", så gamle
// valg ikke dukker op igen, hvis medicinen tilføjes på ny senere.
export function clearScheduleFor(slug) {
  const schedule = getSchedule();
  if (!(slug in schedule)) return schedule;
  const next = { ...schedule };
  delete next[slug];
  return save(next);
}

export function subscribeSchedule(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(DOSE_SCHEDULE_EVENT, handler);
  return () => window.removeEventListener(DOSE_SCHEDULE_EVENT, handler);
}
