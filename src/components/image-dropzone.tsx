import { Upload } from "lucide-react";
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
      "image/*": [".jpeg", ".jpg", ".webp"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  return (
    <div className="w-full">
      <label className="text-gray-500 mb-2 block">Portrait Image</label>

      <div
        {...getRootProps()}
        className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
            ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }
          `}
      >
        <input {...getInputProps()} />
        {image ? (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="max-w-full max-h-48 mx-auto rounded-lg"
          />
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <Upload size={48} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? "Drop your image here" : "Upload your image"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPEG, WebP (max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDropzone;
