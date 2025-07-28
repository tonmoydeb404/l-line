"use client";

import { Upload } from "lucide-react"; // Removed X icon
import React from "react";
import { useDropzone } from "react-dropzone";

interface ImageDropzoneProps {
  image: File | null;
  setImage: (image: File | null) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ image, setImage }) => {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setImage(acceptedFiles[0]);
      }
    },
    [setImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".webp", ".png"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 5MB limit
  });

  return (
    <div className="w-full space-y-3">
      <label className="flex items-center gap-2 text-gray-700 font-medium">
        <Upload size={16} />
        Portrait Image
      </label>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all duration-200
          ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : image
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
        `}
      >
        <input {...getInputProps()} />
        {image ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(image) || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto rounded-md shadow-sm"
            />
            {/* Removed the individual remove button here */}
            <div className="mt-4 text-sm text-gray-600">
              Click or drag a new image to replace
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? "Drop your image here" : "Upload your portrait"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPEG, PNG, WebP (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDropzone;
