import { Dispatch, SetStateAction, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tooltip } from "@/components/Tooltip";
import Image from "next/image";

export interface ICollectionImageUpload {
  variant: "default" | "uri";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  imagePreview: string;
  setImagePreview: Dispatch<SetStateAction<string>>;
  setCollectionImageFile?: Dispatch<SetStateAction<File | undefined>>;
}

export const CollectionImageUpload: React.FC<ICollectionImageUpload> = ({
  form,
  variant,
  imagePreview,
  setImagePreview,
  setCollectionImageFile,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        if (setCollectionImageFile) setCollectionImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setImagePreview(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [setImagePreview, setCollectionImageFile]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
  });

  return (
    <FormField
      name="collectionImage"
      control={form.control}
      render={() => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>
              {variant === "uri"
                ? "Upload your NFT image"
                : "Collection Preview Image"}
            </FormLabel>
            <Tooltip>
              Upload or drop an image for your collection (PNG, JPEG, JPG, GIF).
            </Tooltip>
          </div>

          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition"
          >
            <input {...getInputProps()} />
            <p className="text-sm text-muted-foreground">
            {variant === "uri" ? "Drag & drop your NFT image, or click to select a file" : "Drag & drop an image here, or click to select a file"}
            </p>
          </div>

          {imagePreview && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Preview:</p>
              <Image
                src={imagePreview}
                alt="Collection Preview"
                className="rounded-lg border border-gray-300 mt-1"
                width={200}
                height={200}
              />
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
