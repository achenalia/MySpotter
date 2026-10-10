export type Landmark = { x: number; y: number; z: number; visibility?: number };

export type PoseCameraStatus =
  | "requesting-camera"
  | "preview-ready"
  | "loading-tracker"
  | "ready"
  | "error";

export type PoseCameraProps = {
  onPose?: (landmarks: Landmark[]) => void;
  onPoseFrame?: (landmarks: Landmark[] | null, aspectRatio?: number) => void;
  onStatusChange?: (status: PoseCameraStatus, message?: string) => void;
  showSkeleton?: boolean;
  active?: boolean;
};