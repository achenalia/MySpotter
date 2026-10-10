import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { colors, spacing } from "@/constants/theme";

type RangeSliderProps = {
  /** Smallest and largest values the range can cover. */
  min: number;
  max: number;
  /** The selected range. */
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  step?: number;
};

const THUMB_SIZE = 22;

const clamp = (value: number, lo: number, hi: number) => Math.min(Math.max(value, lo), hi);

type Latest = Required<Omit<RangeSliderProps, "step">> & { step: number; trackWidth: number };

/** Drag handler for one handle. Reads current values from `latest` while dragging. */
function makeResponder(thumb: "low" | "high", latest: RefObject<Latest>) {
  let startValue = 0;
  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      startValue = latest.current[thumb];
    },
    onPanResponderMove: (_, gesture) => {
      const { min, max, low, high, step, trackWidth, onChange } = latest.current;
      if (trackWidth <= 0) return;
      const raw = startValue + (gesture.dx / trackWidth) * (max - min);
      const stepped = Math.round(raw / step) * step;
      if (thumb === "low") {
        const next = clamp(stepped, min, high);
        if (next !== low) onChange(next, high);
      } else {
        const next = clamp(stepped, low, max);
        if (next !== high) onChange(low, next);
      }
    },
  });
}

/**
 * Min and max number boxes above a two-handle slider. The left handle sets the
 * min, the right handle sets the max, and the line between them is highlighted.
 */
export function RangeSlider({ min, max, low, high, onChange, step = 1 }: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  // Latest values for the drag handlers, which are created once.
  const latest = useRef<Latest>({ min, max, low, high, step, trackWidth, onChange });
  useEffect(() => {
    latest.current = { min, max, low, high, step, trackWidth, onChange };
  });

  const span = Math.max(max - min, 1);
  const toPosition = (value: number) => ((value - min) / span) * trackWidth;

  // The handlers only read `latest` while dragging, never during render. They must be
  // created once: replacing a PanResponder mid-drag would lose the gesture.
  // eslint-disable-next-line react-hooks/refs
  const lowResponder = useMemo(() => makeResponder("low", latest), []);
  // eslint-disable-next-line react-hooks/refs
  const highResponder = useMemo(() => makeResponder("high", latest), []);

  const lowX = toPosition(low);
  const highX = toPosition(high);
  // If both handles sit at the far right, keep the min handle on top so it can still be dragged.
  const lowOnTop = low >= max;

  return (
    <View style={styles.container}>
      <View style={styles.fields}>
        <NumberField
          label="Min"
          value={low}
          onCommit={(value) => onChange(clamp(value, min, high), high)}
        />
        <Text style={styles.dash}>–</Text>
        <NumberField
          label="Max"
          value={high}
          onCommit={(value) => onChange(low, clamp(value, low, max))}
        />
      </View>

      <View
        style={styles.slider}
        onLayout={(event: LayoutChangeEvent) =>
          setTrackWidth(event.nativeEvent.layout.width - THUMB_SIZE)
        }
      >
        <View style={styles.track} />
        <View style={[styles.highlight, { left: lowX + THUMB_SIZE / 2, width: highX - lowX }]} />
        <View
          {...lowResponder.panHandlers}
          style={[styles.thumb, { left: lowX, zIndex: lowOnTop ? 2 : 1 }]}
          accessibilityRole="adjustable"
          accessibilityLabel="Minimum"
          accessibilityValue={{ min, max, now: low }}
        />
        <View
          {...highResponder.panHandlers}
          style={[styles.thumb, { left: highX, zIndex: lowOnTop ? 1 : 2 }]}
          accessibilityRole="adjustable"
          accessibilityLabel="Maximum"
          accessibilityValue={{ min, max, now: high }}
        />
      </View>
    </View>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onCommit: (value: number) => void;
};

/** A number box that applies its value when you finish typing (blur or Enter). */
function NumberField({ label, value, onCommit }: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    const parsed = draft === null ? NaN : parseInt(draft, 10);
    if (!Number.isNaN(parsed)) onCommit(parsed);
    setDraft(null);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={draft ?? String(value)}
        onFocus={() => setDraft(String(value))}
        onChangeText={(text) => setDraft(text.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        returnKeyType="done"
        accessibilityLabel={`${label} days`}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  fields: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  field: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: colors.muted },
  input: {
    backgroundColor: colors.panel,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 14,
    color: colors.text,
  },
  dash: { paddingBottom: 8, color: colors.muted },
  slider: { height: THUMB_SIZE + 8, justifyContent: "center" },
  track: {
    position: "absolute",
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.overlayStrong,
  },
  highlight: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.panel,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
