import { useState } from "react";
import ImageDropzone from "../components/image-dropzone";

type Props = {};

const App = (_props: Props) => {
  const [image, setImage] = useState<File | null>(null);
  return (
    <div className="content-center w-full min-h-screen">
      <ImageDropzone image={image} setImage={setImage} />
    </div>
  );
};

export default App;
