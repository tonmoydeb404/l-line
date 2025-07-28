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
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  const removeImage = () => {
    setImage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!image ? (
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
                Supports: JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img
              src={URL.createObjectURL(image)}
              alt="Uploaded preview"
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {image.name}
              </p>
              <p className="text-xs text-gray-500">
                {(image.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeImage}
              className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
