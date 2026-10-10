import { loadData, saveData } from "../lib/storage";

type StreakData = { count: number; lastDate: string }; // lastDate as "YYYY-MM-DD"

const KEY = "streak";

// Local calendar date, so "today" matches the user's own day
const dateString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getToday = () => dateString(new Date());

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateString(d);
};

// Records that the user did their daily thing today
export async function checkIn(): Promise<StreakData> {
  const today = getToday();
  const saved = await loadData<StreakData>(KEY);

  if (saved && saved.lastDate === today) {
    return saved; // already counted today
  }

  const next: StreakData =
    saved && saved.lastDate === getYesterday()
      ? { count: saved.count + 1, lastDate: today } // continued the streak
      : { count: 1, lastDate: today }; // first check-in, or a missed day

  await saveData(KEY, next);
  return next;
}

// Reads the current streak without changing anything
export async function getStreak(): Promise<{ count: number; checkedInToday: boolean }> {
  const saved = await loadData<StreakData>(KEY);
  if (!saved) return { count: 0, checkedInToday: false };

  const checkedInToday = saved.lastDate === getToday();
  const stillAlive = checkedInToday || saved.lastDate === getYesterday();

  // If a day was missed, show 0 even though the old value is still stored
  return { count: stillAlive ? saved.count : 0, checkedInToday };
}