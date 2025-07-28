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
  { language: "C", id: "c", usagePercent: 7 },
  { language: "Swift", id: "swift", usagePercent: 6 },

  // Mobile & Modern Languages
  { language: "Kotlin", id: "kotlin", usagePercent: 5 },
  { language: "Dart", id: "dart", usagePercent: 4 },
  { language: "PHP", id: "php", usagePercent: 8 },
  { language: "Ruby", id: "ruby", usagePercent: 5 },
  { language: "Node.js", id: "nodejs", usagePercent: 18 },

  // Web Technologies
  { language: "HTML", id: "html", usagePercent: 30 },
  { language: "CSS", id: "css", usagePercent: 28 },

  // Functional & Academic Languages
  { language: "Haskell", id: "haskell", usagePercent: 2 },
  { language: "Scala", id: "scala", usagePercent: 3 },
  { language: "R", id: "r", usagePercent: 4 },

  // Shell & Scripting
  { language: "Bash", id: "bash", usagePercent: 6 },
  { language: "PowerShell", id: "powershell", usagePercent: 3 },
  { language: "Perl", id: "perl", usagePercent: 2 },

  // Emerging & Specialized Languages
  { language: "Elixir", id: "elixir", usagePercent: 2 },
  { language: "Crystal", id: "crystal", usagePercent: 1 },
  { language: "Zig", id: "zig", usagePercent: 1 },
  { language: "V", id: "vlang", usagePercent: 1 },
  { language: "Nim", id: "nim", usagePercent: 1 },
  { language: "Julia", id: "julia", usagePercent: 2 },
  { language: "Lua", id: "lua", usagePercent: 2 },

  // JVM Languages
  { language: "Clojure", id: "clojure", usagePercent: 1 },
  { language: "Groovy", id: "groovy", usagePercent: 1 },

  // Microsoft Ecosystem
  { language: "F#", id: "fsharp", usagePercent: 1 },
  { language: "VB.NET", id: "dotnetcore", usagePercent: 2 },

  // Database & Query Languages
  { language: "SQL", id: "sql", usagePercent: 12 },

  // Scientific & Data Languages
  { language: "MATLAB", id: "matlab", usagePercent: 3 },
  { language: "Fortran", id: "fortran", usagePercent: 1 },

  // Assembly & Low-level
  { language: "Assembly", id: "assembly", usagePercent: 1 },

  // Markup & Config Languages
  { language: "XML", id: "xml", usagePercent: 8 },
  { language: "JSON", id: "json", usagePercent: 15 },
  { language: "YAML", id: "yaml", usagePercent: 6 },
  { language: "TOML", id: "toml", usagePercent: 2 },

  // Older but Still Used
  { language: "COBOL", id: "cobol", usagePercent: 1 },
  { language: "Pascal", id: "pascal", usagePercent: 1 },
  { language: "Delphi", id: "delphi", usagePercent: 1 },

  // Blockchain & Smart Contracts
  { language: "Solidity", id: "solidity", usagePercent: 2 },

  // Game Development
  { language: "GDScript", id: "godot", usagePercent: 1 },

  // Template Languages
  { language: "Handlebars", id: "handlebars", usagePercent: 3 },

  // Runtime Environments
  { language: "Deno", id: "deno", usagePercent: 2 },

  // Additional Modern Languages
  { language: "Carbon", id: "carbon", usagePercent: 1 },
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
