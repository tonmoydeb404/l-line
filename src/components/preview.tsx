import type { Face } from "@tensorflow-models/face-detection";
import { Download } from "lucide-react";
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

  // Download canvas as image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link
    const link = document.createElement("a");
    link.download = `l-line-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const drawLine = (
    ctx: CanvasRenderingContext2D,
    langPos: LanguagePosition
  ) => {
    const {
      fromPoint,
      position,
      usagePercent,
      scaleFactor,
      icon,
      language,
      iconSize,
    } = langPos;

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

    // Draw language icon or fallback using dynamic iconSize
    if (icon) {
      // Draw the actual icon with dynamic size
      ctx.drawImage(
        icon,
        position.x - iconSize / 2,
        position.y - iconSize / 2,
        iconSize, // Use dynamic iconSize instead of fixed 50 * scaleFactor
        iconSize
      );
    } else {
      // Fallback: draw circle with text, scaled proportionally to iconSize
      const circleRadius = iconSize / 2; // Circle radius based on iconSize
      const primaryFontSize = Math.max(8, iconSize / 3); // Font size based on iconSize

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

      {/* Download button - only show when we have language positions */}
      {languagePositions.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={downloadImage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Download size={16} />
            Download L-Line
          </button>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
