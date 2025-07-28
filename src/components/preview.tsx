import type { Face } from "@tensorflow-models/face-detection";
import React, { useEffect } from "react";
import {
  useLineGenerator,
  type LanguageData,
  type LanguagePosition,
} from "../hooks/use-line-generator";

interface ImagePreviewProps {
  image: File | null;
  face: Face | null;
  languages: LanguageData[];
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  face,
  languages,
}) => {
  const { languagePositions, canvasRef, imageRef } = useLineGenerator({
    image,
    face,
    languages,
  });

  // Draw a single line with icon
  const drawLine = (
    ctx: CanvasRenderingContext2D,
    langPos: LanguagePosition
  ) => {
    const { fromPoint, position, usagePercent, scaleFactor, icon, language } =
      langPos;

    // Scale line width based on usage percentage
    const baseLineWidth = 3 * scaleFactor;
    const maxLineWidth = 10 * scaleFactor;
    const lineWidth = Math.max(
      baseLineWidth,
      (usagePercent / 100) * maxLineWidth
    );

    // Draw line
    ctx.save();
    ctx.strokeStyle = "rgba(255,0,0,0.3)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    // Add glow effect
    ctx.shadowColor = "rgba(255,0,0,0.3)";
    ctx.shadowBlur = 15 * scaleFactor;

    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();

    ctx.restore();

    // Draw language icon or fallback
    const iconSize = 50 * scaleFactor;

    if (icon) {
      // Draw the actual icon
      ctx.drawImage(
        icon,
        position.x - iconSize / 2,
        position.y - iconSize / 2,
        iconSize,
        iconSize
      );
    } else {
      // Fallback: draw circle with text
      const circleRadius = 25 * scaleFactor;
      const primaryFontSize = Math.max(12, 18 * scaleFactor);

      ctx.save();
      ctx.fillStyle = "#666666";
      ctx.beginPath();
      ctx.arc(position.x, position.y, circleRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw language text
      ctx.fillStyle = "white";
      ctx.font = `bold ${primaryFontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(language.toUpperCase().slice(0, 2), position.x, position.y);

      ctx.restore();
    }
  };

  // Draw the complete visualization
  const drawVisualization = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !img || !ctx) return;

    // Clear and draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Draw lines and icons if positions are available
    if (languagePositions.length > 0) {
      languagePositions.forEach((langPos) => {
        drawLine(ctx, langPos);
      });
    }
  };

  // Redraw when languagePositions change
  useEffect(() => {
    if (languagePositions.length > 0) {
      drawVisualization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagePositions]);

  // Show nothing if no image
  if (!image) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <img ref={imageRef} className="hidden" alt="Source" />
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ maxHeight: "600px", objectFit: "contain" }}
        />
      </div>
    </div>
  );
};

export default ImagePreview;
