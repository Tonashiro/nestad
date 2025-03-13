export const uploadToPinata = async ({
  name,
  description,
  file,
}: {
  name: string;
  description?: string;
  file: File;
}): Promise<string> => {
  try {
    if (!file) {
      throw new Error("No file found");
    }

    const formData = new FormData();
    formData.append("file", file);

    const imageUploadResponse = await fetch("/api/pinata/upload", {
      method: "POST",
      body: formData,
    });

    const imageUrl = await imageUploadResponse.json();
    console.log("Uploaded Image URL:", imageUrl);

    const metadata = {
      name,
      description: description || "",
      image: imageUrl,
    };

    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });

    const metadataFile = new File([metadataBlob], "metadata.json", {
      type: "application/json",
    });

    const metadataFormData = new FormData();
    metadataFormData.append("file", metadataFile);

    const metadataUploadResponse = await fetch("/api/pinata/upload", {
      method: "POST",
      body: metadataFormData,
    });

    const metadataUrl = await metadataUploadResponse.json();

    return metadataUrl;
  } catch (error) {
    console.error("Pinata upload failed:", error);
    throw new Error("Upload to Pinata failed.");
  }
};
