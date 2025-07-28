import {
  createDetector,
  SupportedModels,
  type Face,
  type FaceDetector,
} from "@tensorflow-models/face-detection";
import "@tensorflow/tfjs-backend-webgl";
import { useCallback, useRef, useState } from "react";

type DetectionStatus =
  | "idle"
  | "loading"
  | "success"
  | "no-face"
  | "multiple-faces"
  | "error";

interface UseDetectFaceReturn {
  detectFace: (file: File) => Promise<Face>;
  status: DetectionStatus;
  face: Face | null;
  isLoading: boolean;
}

const useDetectFace = (): UseDetectFaceReturn => {
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [face, setFace] = useState<Face | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const modelRef = useRef<FaceDetector | null>(null);

  const loadModel = useCallback(async () => {
    if (modelRef.current) {
      return modelRef.current;
    }

    try {
      const model = SupportedModels.MediaPipeFaceDetector;
      const detector = await createDetector(model, { runtime: "tfjs" });
      modelRef.current = detector;
      return detector;
    } catch (error) {
      modelRef.current = null;
      console.error("Error loading model:", error);
      throw error;
    }
  }, []);

  const detectFace = useCallback(
    async (file: File): Promise<Face> => {
      try {
        setIsLoading(true);
        setStatus("loading");
        setFace(null);

        // Load model if not already loaded
        const model = await loadModel();

        // Create image element
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Unable to get canvas context");
        }

        // Load image
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = URL.createObjectURL(file);
        });

        // Set canvas size and draw image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        // Detect faces
        const predictions = await model.estimateFaces(canvas);

        // Cleanup image URL
        URL.revokeObjectURL(img.src);

        // Validate face count and throw specific errors
        if (predictions.length === 0) {
          setStatus("no-face");
          throw new Error("No face detected in the image");
        }

        if (predictions.length > 1) {
          setStatus("multiple-faces");
          throw new Error(
            "Multiple faces detected. Please use an image with only one person"
          );
        }

        // Success case
        const detectedFace = predictions[0];
        setFace(detectedFace);
        setStatus("success");

        return detectedFace;
      } catch (error) {
        console.error("Error during face detection:", error);
        setStatus("error");
        setFace(null);
        throw error; // Re-throw the error for the caller to handle
      } finally {
        setIsLoading(false);
      }
    },
    [loadModel]
  );

  return {
    detectFace,
    status,
    face,
    isLoading,
  };
};

export default useDetectFace;
