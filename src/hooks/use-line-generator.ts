import type { Face } from "@tensorflow-models/face-detection";
import { useEffect, useRef, useState } from "react";
import { loadLanguageIcon } from "../config/icon";

export interface LanguageData {
  language: string;
  id: string;
  usagePercent: number;
}

export interface LanguagePosition {
  id: string;
  language: string;
  usagePercent: number;
  position: { x: number; y: number };
  fromPoint: { x: number; y: number };
  scaleFactor: number;
  icon?: HTMLImageElement;
}

interface UseLineGeneratorProps {
  image: File | null;
  face: Face | null;
  languages: LanguageData[];
}

interface UseLineGeneratorReturn {
  languagePositions: LanguagePosition[];
  isLoading: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
}

export const useLineGenerator = ({
  image,
  face,
  languages,
}: UseLineGeneratorProps): UseLineGeneratorReturn => {
  const [languagePositions, setLanguagePositions] = useState<
    LanguagePosition[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Process MediaPipe face data into our landmark format
  const processFaceData = (face: Face) => {
    const box = face.box;
    const keypoints = face.keypoints;

    // Extract key facial points from MediaPipe keypoints
    const leftEye =
      keypoints.find((kp) => kp.name === "leftEye") || keypoints[1];
    const rightEye =
      keypoints.find((kp) => kp.name === "rightEye") || keypoints[0];

    // Calculate eye center for top of head estimation
    const eyeCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2,
    };

    // Estimate top of head (extrapolate above eyes)
    const topOfHead = {
      x: eyeCenter.x,
      y: Math.max(0, eyeCenter.y - box.height * 0.4),
    };

    return { topOfHead };
  };

  // Generate language positions
  const generateLanguagePositions = async () => {
    const canvas = canvasRef.current;

    if (!canvas || !face || languages.length === 0) {
      setLanguagePositions([]);
      setIsLoading(false);
      return;
    }

    const { topOfHead } = processFaceData(face);

    // Scale factor based on image size
    const imageSize = Math.min(canvas.width, canvas.height);
    const scaleFactor = imageSize / 500;

    // Position languages at the very top of the image
    const positions: LanguagePosition[] = [];

    for (let index = 0; index < languages.length; index++) {
      const lang = languages[index];
      const totalWidth = canvas.width;
      const spacing = totalWidth / (languages.length + 1);

      const position = {
        x: spacing * (index + 1),
        y: 50 * scaleFactor, // Fixed distance from top
      };

      // Try to load the icon
      let icon: HTMLImageElement | undefined;
      try {
        icon = await loadLanguageIcon(lang.id);
      } catch (error) {
        console.warn(`Failed to load icon for ${lang.id}:`, error);
        // Will use fallback text rendering
      }

      positions.push({
        id: lang.id,
        language: lang.language,
        usagePercent: lang.usagePercent,
        position,
        fromPoint: topOfHead,
        scaleFactor,
        icon,
      });
    }

    setLanguagePositions(positions);
    setIsLoading(false);
  };

  // Setup canvas when image loads
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw the base image
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
    }
  };

  // Initialize canvas and language positions
  useEffect(() => {
    if (!image) {
      setLanguagePositions([]);
      return;
    }

    const img = imageRef.current;
    if (!img) return;

    img.onload = () => {
      setupCanvas();
      if (face && languages.length > 0) {
        setIsLoading(true);
        generateLanguagePositions();
      }
    };

    img.src = URL.createObjectURL(image);

    // Cleanup
    return () => {
      URL.revokeObjectURL(img.src);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, face, languages]);

  return {
    languagePositions,
    isLoading,
    canvasRef,
    imageRef,
  };
};
