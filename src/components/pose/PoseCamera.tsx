import { Text, View } from "react-native";
import type { PoseCameraProps } from "./types";

export function PoseCamera(_props: PoseCameraProps) {
  return (
    <View style={{ padding: 16 }}>
      <Text>Pose detection is only available on web for now.</Text>
    </View>
  );
}