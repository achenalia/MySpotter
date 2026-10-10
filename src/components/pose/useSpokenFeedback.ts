import * as Speech from "expo-speech";
import { useEffect, useRef } from "react";
import { loadData, saveData } from "@/lib/storage";
import type { ExerciseState } from "./analyze";

const COOLDOWN_MS = 6000; // don't repeat the same live cue more often than this
const RATE = 0.9; // 1 is normal speed; lower is slower and easier to follow
const LANGUAGE = "en"; // language prefix to list, e.g. "en", "es"
const STORAGE_KEY = "voice";

let chosenVoice: string | undefined;
let loadedSaved = false;
const lastSpoken: Record<string, number> = {};

export type VoiceOption = {
  id: string;
  name: string;
  language: string;
};

// Rank voices so the likely-best ones appear first in the list
function score(v: Speech.Voice) {
  const name = v.name.toLowerCase();
  let s = 0;
  if (v.quality === Speech.VoiceQuality.Enhanced) s += 10;
  if (/natural|neural|premium|enhanced/.test(name)) s += 5;
  if (name.includes("google")) s += 3;
  if (v.language?.toLowerCase() === "en-us") s += 1;
  return s;
}

// Lists the device's voices for the configured language, best first.
// Also restores the saved choice, or picks the top-ranked voice by default.
export async function getVoiceOptions(): Promise<VoiceOption[]> {
  let voices = await Speech.getAvailableVoicesAsync();
  if (voices.length === 0) {
    // Browsers sometimes load their voice list a moment late
    await new Promise((r) => setTimeout(r, 500));
    voices = await Speech.getAvailableVoicesAsync();
  }

  const matching = voices
    .filter((v) => v.language?.toLowerCase().startsWith(LANGUAGE))
    .sort((a, b) => score(b) - score(a));

  if (!loadedSaved) {
    loadedSaved = true;
    const saved = await loadData<string>(STORAGE_KEY);
    if (saved && matching.some((v) => v.identifier === saved)) {
      chosenVoice = saved;
    }
  }
  if (!chosenVoice) chosenVoice = matching[0]?.identifier;

  return matching.map((v) => ({
    id: v.identifier,
    name: v.name,
    language: v.language,
  }));
}

export function getSelectedVoice() {
  return chosenVoice;
}

// Switches to a voice, saves the choice, and plays a sample so you can hear it
export async function selectVoice(id: string) {
  chosenVoice = id;
  await saveData(STORAGE_KEY, id);
  Speech.stop();
  Speech.speak("Keep your chest up", { voice: id, rate: RATE });
}

function say(text: string, force = false) {
  const now = Date.now();
  if (!force && now - (lastSpoken[text] ?? 0) < COOLDOWN_MS) return;
  lastSpoken[text] = now;
  Speech.stop(); // the newest feedback matters most, so cut off older speech
  Speech.speak(text, {
    rate: RATE,
    voice: chosenVoice,
    language: chosenVoice ? undefined : "en-US",
  });
}

export function useSpokenFeedback(state: ExerciseState, enabled: boolean) {
  const prevReps = useRef(0);

  // Load voices when voice is switched on, so one is ready before the first cue
  useEffect(() => {
    if (enabled) getVoiceOptions();
  }, [enabled]);

  // Live cues, e.g. "Keep your chest up"
  const cue = state.cues[0];
  useEffect(() => {
    if (enabled && cue) say(cue);
  }, [cue, enabled]);

  // After each rep: say the rep number, plus a note if the rep wasn't good
  useEffect(() => {
    if (enabled && state.reps > prevReps.current) {
      const note =
        state.repFeedback && state.repFeedback !== "Good rep"
          ? `. ${state.repFeedback}`
          : "";
      say(`${state.reps}${note}`, true);
    }
    prevReps.current = state.reps;
  }, [state.reps, state.repFeedback, enabled]);

  // Stop talking when voice is turned off or the page closes
  useEffect(() => {
    if (!enabled) Speech.stop();
    return () => {
      Speech.stop();
    };
  }, [enabled]);
}