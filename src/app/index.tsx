import {
  LucideLoader2,
  LucideSparkles,
  LucideUpload,
  LucideUser,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ImageDropzone from "../components/image-dropzone";
import ImagePreview from "../components/preview";
import useDetectFace from "../hooks/use-detect-face";
import { useFetchLanguages } from "../hooks/use-fetch-language";

type Props = {};

const App = (_props: Props) => {
  const [image, setImage] = useState<File | null>(null);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { fetchLanguages, languages } = useFetchLanguages();

  const { detectFace, face } = useDetectFace();

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

      toast.success("Image generated!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 container mx-auto py-10 gap-5">
      <div>
        <div className="border border-gray-200 p-4 rounded-2xl">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
            <LucideUpload size={18} />
            Upload & Configure
          </h2>

          <ImageDropzone image={image} setImage={setImage} />

          <div className="w-full mt-5">
            <label className="text-gray-500 mb-2 block">Github Username</label>
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
                className={`
            block w-full pl-12 pr-4 py-3 
            border border-gray-300 rounded-lg 
            bg-white text-gray-900 placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-all duration-200 ease-in-out
            hover:border-gray-400
            ${isLoading ? "animate-pulse" : ""}
          `}
              />
            </div>
          </div>

          <button
            className="w-full py-2 flex gap-2 items-center justify-center bg-blue-500 rounded-md text-blue-50 font-semibold hover:bg-blue-600 duration-200 cursor-pointer mt-10"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Generating <LucideLoader2 size={18} className="animate-spin" />
              </>
            ) : (
              <>
                Generate <LucideSparkles size={18} />
              </>
            )}
          </button>
        </div>
      </div>
      <div className="p-4 border border-gray-200 rounded-2xl">
        {image && face && (
          <ImagePreview image={image} face={face} languages={languages} />
        )}
      </div>
    </div>
  );
};

export default App;
