"use client";

import type { Face } from "@tensorflow-models/face-detection";
import { Download } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
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

  // Download canvas as JPEG
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const timestamp = new Date().toISOString().slice(0, 10);
    const languageCount = languagePositions.length;
    const filename = `l-line-${timestamp}-${languageCount}langs.jpg`;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          // PNG fallback
          const link = document.createElement("a");
          link.download = filename.replace(".jpg", ".png");
          link.href = canvas.toDataURL("image/png", 0.8);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }

        // JPEG download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
      },
      "image/jpeg",
      0.85
    );
  };

  // Draw a single line with enhanced styling
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

    // Calculate line width with better scaling
    const baseLineWidth = 2 * scaleFactor;
    const maxLineWidth = 6 * scaleFactor;
    const lineWidth = Math.max(
      baseLineWidth,
      (usagePercent / 100) * maxLineWidth
    );

    // Draw line with subtle gradient
    ctx.save();

    const gradient = ctx.createLinearGradient(
      fromPoint.x,
      fromPoint.y,
      position.x,
      position.y
    );
    gradient.addColorStop(0, "rgba(220, 38, 38, 0.8)"); // Red start
    gradient.addColorStop(1, "rgba(185, 28, 28, 0.7)"); // Darker Red end

    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"; // Subtle shadow
    ctx.shadowBlur = 5 * scaleFactor;
    ctx.shadowOffsetY = 2 * scaleFactor;

    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
    ctx.restore();

    // Draw icon with enhanced styling
    if (icon) {
      // Draw white background circle
      ctx.save();
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        position.x,
        position.y,
        iconSize / 2 + 3 * scaleFactor,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.restore();

      // Draw the icon
      ctx.drawImage(
        icon,
        position.x - iconSize / 2,
        position.y - iconSize / 2,
        iconSize,
        iconSize
      );
    } else {
      // Enhanced text fallback
      const circleRadius = iconSize / 2;
      const fontSize = Math.max(10, iconSize / 3);

      ctx.save();
      // Draw background circle
      ctx.fillStyle = "#3B82F6"; // A clean red
      ctx.beginPath();
      ctx.arc(position.x, position.y, circleRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw text
      ctx.fillStyle = "white";
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(language.toUpperCase().slice(0, 2), position.x, position.y);
      ctx.restore();
    }
  };

  // Draw complete visualization
  const drawVisualization = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !img || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    languagePositions.forEach((langPos) => {
      drawLine(ctx, langPos);
    });
  };

  // Redraw when positions change
  useEffect(() => {
    if (languagePositions.length > 0) {
      drawVisualization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagePositions]);

  if (!image) return null;

  return (
    <div className="w-full">
      <div className="relative">
        <img ref={imageRef} className="hidden" alt="Source" />
        <canvas
          ref={canvasRef}
          className="w-full h-auto border border-gray-200 rounded-md shadow-sm"
          style={{ maxHeight: "600px", objectFit: "contain" }}
        />
      </div>

      {languagePositions.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={downloadImage}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Download size={18} />
            Download L-Line
          </button>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
