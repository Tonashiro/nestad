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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  collectionImage: string;
  setCollectionImage: Dispatch<SetStateAction<string>>;
}

export const CollectionImageUpload: React.FC<ICollectionImageUpload> = ({
  form,
  collectionImage,
  setCollectionImage,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setCollectionImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [form]
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
            <FormLabel>Collection Image</FormLabel>
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
              Drag & drop an image here, or click to select a file
            </p>
          </div>

          {collectionImage && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Preview:</p>
              <Image
                src={collectionImage}
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
