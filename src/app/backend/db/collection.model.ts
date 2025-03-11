import { ICollection } from "@/types";
import mongoose, { Schema, Document } from "mongoose";

type CollectionSchema = ICollection & Document;

const CollectionSchema = new Schema<CollectionSchema>(
  {
    collectionAddress: {
      type: String,
      required: true,
      minlength: 42,
      maxlength: 42,
      unique: true,
    },
    contractOwner: { type: String, required: true },
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    symbol: { type: String, required: true, minlength: 3, maxlength: 10 },
    baseUri: { type: String },
    description: { type: String, maxlength: 300 },
    collectionImage: { type: String },
    maxTokens: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    whitelistPrice: { type: Number, min: 0 },
    maxMintPerTx: { type: Number, required: true, min: 1 },
    maxMintPerWallet: { type: Number, required: true, min: 1 },
    publicSaleStart: { type: Date },
    publicSaleEnd: { type: Date },
    hasWhitelist: { type: Boolean, default: false },
    whitelistStart: { type: Date },
    whitelistEnd: { type: Date },
    whitelistWallets: { type: [String], default: [] },
    royaltyFee: { type: Number, required: true, min: 0, max: 9 },
  },
  { timestamps: true }
);

export default mongoose.models.Collection ||
  mongoose.model<ICollection>("Collection", CollectionSchema);
