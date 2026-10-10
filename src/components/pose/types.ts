export type Landmark = { x: number; y: number; z: number; visibility?: number };

export type PoseCameraProps = {
  onPose?: (landmarks: Landmark[]) => void;
  showSkeleton?: boolean;
  enabled?: boolean;
};