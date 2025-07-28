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

  // Draw a single line with icon
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

    // Calculate line width
    const baseLineWidth = 3 * scaleFactor;
    const maxLineWidth = 10 * scaleFactor;
    const lineWidth = Math.max(
      baseLineWidth,
      (usagePercent / 100) * maxLineWidth
    );

    // Draw line
    ctx.save();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(255, 0, 0, 0.3)";
    ctx.shadowBlur = 15 * scaleFactor;

    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
    ctx.restore();

    // Draw icon or fallback
    if (icon) {
      ctx.drawImage(
        icon,
        position.x - iconSize / 2,
        position.y - iconSize / 2,
        iconSize,
        iconSize
      );
    } else {
      // Text fallback
      const circleRadius = iconSize / 2;
      const fontSize = Math.max(8, iconSize / 3);

      ctx.save();
      ctx.fillStyle = "#666666";
      ctx.beginPath();
      ctx.arc(position.x, position.y, circleRadius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = `bold ${fontSize}px Arial`;
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <img ref={imageRef} className="hidden" alt="Source" />
        <canvas
          ref={canvasRef}
          className="w-full h-auto border border-gray-200 rounded-lg shadow-lg"
          style={{ maxHeight: "600px", objectFit: "contain" }}
        />
      </div>

      {languagePositions.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={downloadImage}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
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
