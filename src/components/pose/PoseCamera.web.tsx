import type * as Tasks from "@mediapipe/tasks-vision"; // types only, erased at build time
import { useEffect, useRef } from "react";
import type { PoseCameraProps, PoseCameraStatus } from "./types";

// Google's docs use @latest. If you pinned a specific version earlier, swap it in here.
const BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
const BUNDLE_URL = `${BASE}/vision_bundle.mjs`;
const WASM_URL = `${BASE}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// new Function hides the import() call from Metro's parser
const importFromUrl = new Function("url", "return import(url)") as (
  url: string
) => Promise<typeof Tasks>;

// Fills its parent, so the parent decides how big the camera is
export function PoseCamera({
  onPose,
  onPoseFrame,
  onStatusChange,
  showSkeleton = true,
  active = true,
}: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onPoseRef = useRef(onPose);
  const onPoseFrameRef = useRef(onPoseFrame);
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onPoseRef.current = onPose;
    onPoseFrameRef.current = onPoseFrame;
    onStatusChangeRef.current = onStatusChange;
  }, [onPose, onPoseFrame, onStatusChange]);

  useEffect(() => {
    let landmarker: Tasks.PoseLandmarker | undefined;
    let stream: MediaStream | undefined;
    let raf = 0;
    let cancelled = false;

    (async () => {
      const setStatus = (status: PoseCameraStatus, message?: string) =>
        onStatusChangeRef.current?.(status, message);

      try {
        if (!active) return;
        setStatus("requesting-camera");
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not provide camera access.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        const video = videoRef.current;
        if (cancelled || !video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        setStatus("preview-ready");
        setStatus("loading-tracker");

        const { FilesetResolver, PoseLandmarker, DrawingUtils } =
          await importFromUrl(BUNDLE_URL);
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        setStatus("ready");

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const drawing = ctx ? new DrawingUtils(ctx) : null;

        let lastTime = -1;
        const loop = () => {
          if (landmarker && video.currentTime !== lastTime) {
            lastTime = video.currentTime;
            const result = landmarker.detectForVideo(video, performance.now());
            const lms = result.landmarks[0] ?? null;

            if (canvas && ctx && drawing) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (showSkeleton && lms) {
                drawing.drawConnectors(lms, PoseLandmarker.POSE_CONNECTIONS);
                drawing.drawLandmarks(lms, { radius: 3 });
              }
            }
            onPoseFrameRef.current?.(lms, video.videoWidth / video.videoHeight);
            if (lms) onPoseRef.current?.(lms);
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (error) {
        if (cancelled) return;
        const name = error instanceof Error ? error.name : "";
        const message = name === "NotAllowedError" || name === "SecurityError"
          ? "Camera permission was denied. Allow camera access in your browser settings and try again."
          : name === "NotFoundError"
            ? "No camera was found on this device."
            : error instanceof Error
              ? `Camera or motion tracker could not start: ${error.message}`
              : "Camera or motion tracker could not start.";
        setStatus("error", message);
        console.error("Pose setup failed:", error);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
    };
  }, [active, showSkeleton]);

  // Both layers fill the container and use the same object-fit,
  // so the skeleton lines up with the video even when it's letterboxed.
  const layer = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
    transform: "scaleX(-1)", // mirror view (landmark data is unaffected)
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "transparent",
      }}
    >
      <video ref={videoRef} playsInline muted style={layer} />
      <canvas ref={canvasRef} style={layer} />
    </div>
  );
}