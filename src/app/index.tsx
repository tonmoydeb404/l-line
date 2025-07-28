"use client";

import {
  LucideGithub,
  LucideImage,
  LucideLoader2,
  LucideRotateCcw,
  LucideSparkles,
  LucideUpload,
  LucideUser,
} from "lucide-react"; // Added LucideRotateCcw for reset icon
import { useCallback, useState } from "react"; // Added useCallback
import { toast } from "sonner";
import ImageDropzone from "../components/image-dropzone";
import ImagePreview from "../components/preview";
import useDetectFace from "../hooks/use-detect-face";
import { useFetchLanguages } from "../hooks/use-fetch-language";

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { fetchLanguages, languages, resetLanguages } = useFetchLanguages(); // Added resetLanguages
  const { detectFace, face, resetFace } = useDetectFace(); // Added resetFace

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      if (!image) {
        throw new Error("Image is required");
      }

      if (!userName) {
        throw new Error("Username is required");
      }

      await fetchLanguages(userName);
      await detectFace(image);

      toast.success("L-Line generated successfully! 🎉");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate L-Line!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // New reset function
  const resetAll = useCallback(() => {
    setImage(null);
    setUserName("");
    resetLanguages(); // Call reset from useFetchLanguages hook
    resetFace(); // Call reset from useDetectFace hook
    setIsLoading(false);
    toast.info("All fields reset.");
  }, [resetLanguages, resetFace]);

  const hasResults = image && face && languages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            L-Line Generator
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Visualize your programming languages on your portrait.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-md">
                  <LucideUpload size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Upload & Configure
                </h2>
              </div>

              <div className="space-y-6">
                <ImageDropzone image={image} setImage={setImage} />

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <LucideGithub size={16} />
                    GitHub Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LucideUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your GitHub username"
                      disabled={isLoading}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:border-gray-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 py-3 flex gap-3 items-center justify-center bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={handleGenerate}
                    disabled={isLoading || !image || !userName}
                  >
                    {isLoading ? (
                      <>
                        <LucideLoader2 size={20} className="animate-spin" />
                        Generating L-Line...
                      </>
                    ) : (
                      <>
                        <LucideSparkles size={20} />
                        Generate L-Line
                      </>
                    )}
                  </button>
                  {hasResults && (
                    <button
                      className="py-3 px-4 flex gap-2 items-center justify-center bg-gray-200 rounded-md text-gray-700 font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                      onClick={resetAll}
                      disabled={isLoading}
                    >
                      <LucideRotateCcw size={20} />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            {languages.length > 0 && (
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detected Languages ({languages.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {languages.slice(0, 6).map((lang) => (
                    <div
                      key={lang.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                    >
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {lang.language}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {lang.usagePercent}%
                      </span>
                    </div>
                  ))}
                  {languages.length > 6 && (
                    <div className="flex items-center justify-center p-2 bg-gray-100 rounded-md text-sm text-gray-500">
                      +{languages.length - 6} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div>
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 rounded-md">
                  <LucideImage size={20} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
              </div>

              {hasResults ? (
                <ImagePreview image={image} face={face} languages={languages} />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center bg-gray-50 rounded-md border border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <LucideImage size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Preview Available
                  </h3>
                  <p className="text-gray-500 max-w-sm text-sm">
                    Upload an image and enter your GitHub username to generate
                    your L-Line visualization
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
