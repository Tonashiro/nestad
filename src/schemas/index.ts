import { z } from "zod";

export const CreateCollectionSchema = z
  .object({
    name: z
      .string()
      .min(3, "Collection name must be at least 3 characters")
      .max(50, "Collection name must be at most 50 characters")
      .regex(/^[a-zA-Z0-9 ]+$/, "Only letters, numbers, and spaces allowed"),
    symbol: z
      .string()
      .min(3, "Symbol must be at least 3 characters")
      .max(10, "Symbol must be at most 10 characters")
      .regex(/^[a-zA-Z0-9 ]+$/, "Only letters, numbers, and spaces allowed"),
    baseUri: z.string().optional(),
    description: z
      .string()
      .max(300, "Description must be at most 300 characters")
      .optional(),
    maxTokens: z.coerce.number().min(1, "Max supply is required"),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    whitelistPrice: z
      .coerce.number()
      .min(0, "Whitelist price must be at least 0")
      .optional(),
    maxMintPerTx: z.coerce.number().min(1, "Must be at least 1"),
    maxMintPerWallet: z.coerce.number().min(1, "Must be at least 1"),
    hasWhitelist: z.boolean().default(false),
    whitelistStart: z.date().optional(),
    whitelistEnd: z.date().optional(),
    whitelistWallets: z.string().optional(),
    publicSaleStart: z.date().optional(),
    publicSaleEnd: z.date().optional(),
    royaltyFee: z.coerce
      .number()
      .min(0, "Royalty fee must be at least 0%")
      .max(9, "Max royalty fee is 9% (1% is reserved for the platform)"),
  })
  .refine((data) => {
    // ✅ Ensure whitelistPrice is required only when hasWhitelist is true
    if (data.hasWhitelist && (data.whitelistPrice === undefined || isNaN(data.whitelistPrice))) {
      return false;
    }
    return true;
  }, {
    message: "Whitelist price is required when whitelist is enabled",
    path: ["whitelistPrice"], // ✅ Attach the error to the correct field
  });
