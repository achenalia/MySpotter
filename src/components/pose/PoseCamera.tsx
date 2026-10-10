import { useEffect } from "react";
import { Text, View } from "react-native";
import type { PoseCameraProps } from "./types";

export function PoseCamera({ active = true, onStatusChange }: PoseCameraProps) {
  useEffect(() => {
    if (active) {
      onStatusChange?.("error", "Camera motion tracking is currently available in a web browser only.");
    }
  }, [active, onStatusChange]);

  return (
    <View style={{ padding: 16 }}>
      <Text>Camera motion tracking is currently available in a web browser only.</Text>
    </View>
  );
}