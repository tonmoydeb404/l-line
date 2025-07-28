import { LucideLoader2, LucideSparkles, LucideUpload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ImageDropzone from "../components/image-dropzone";
import ImagePreview from "../components/preview";
import useDetectFace from "../hooks/use-detect-face";

type Props = {};

const mockLanguages = [
  // Popular Web Technologies
  { language: "JavaScript", id: "javascript", usagePercent: 35 },
  { language: "TypeScript", id: "typescript", usagePercent: 25 },
  { language: "Python", id: "python", usagePercent: 20 },
  { language: "Java", id: "java", usagePercent: 15 },
  { language: "Go", id: "go", usagePercent: 12 },

  // System & Compiled Languages
  { language: "C++", id: "cpp", usagePercent: 10 },
  { language: "C#", id: "csharp", usagePercent: 9 },
  { language: "Rust", id: "rust", usagePercent: 8 },
];

const App = (_props: Props) => {
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { detectFace, face } = useDetectFace();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      if (!image) {
        throw new Error("Image is required");
      }

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
          <ImagePreview image={image} face={face} languages={mockLanguages} />
        )}
      </div>
    </div>
  );
};

export default App;
