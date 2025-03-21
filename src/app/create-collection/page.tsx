"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ethers, zeroPadBytes } from "ethers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadToPinata } from "@/services/uploadToPinata";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "flatpickr/dist/flatpickr.css";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreateCollectionSchema } from "@/schemas";
import { DateTime } from "@/components/DateTime";
import { Tooltip } from "@/components/Tooltip";
import { Divider } from "@/components/Divider";
import { useAccount, useWalletClient } from "wagmi";
import {
  sameCollectionContractABI,
  sameCollectionContractBytecode,
  uniqueCollectionContractABI,
  uniqueCollectionContractBytecode,
} from "@/constants";
import { cn, generateMerkleRoot } from "@/utils";
import { COLLECTION_TYPE, ICollection } from "@/types";
import { CollectionImageUpload } from "@/components/CollectionImageUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export type FormValues = z.infer<typeof CreateCollectionSchema>;

export default function CreateCollection() {
  const [deploying, setDeploying] = useState(false);
  const [collectionImagePreview, setCollectionImagePreview] = useState("");
  const [collectionNFTPreview, setCollectionNFTPreview] = useState("");
  const [nftFile, setNFTFile] = useState<File | undefined>();
  const { data: walletClient } = useWalletClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [deployedCollectionAddress, setDeployedCollectionAddress] =
    useState("");
  const [collectionType, setCollectionType] = useState<COLLECTION_TYPE>(
    COLLECTION_TYPE.SAME_ART
  );

  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateCollectionSchema),
    defaultValues: {
      name: "",
      symbol: "",
      baseUri: "",
      description: "",
      collectionImagePreview: "",
      maxTokens: undefined,
      price: undefined,
      whitelistPrice: undefined,
      maxMintPerTx: undefined,
      maxMintPerWallet: undefined,
      hasWhitelist: false,
      whitelistStart: undefined,
      whitelistEnd: undefined,
      whitelistWallets: "",
      publicSaleStart: undefined,
      publicSaleEnd: undefined,
      royaltyFee: 0,
    },
  });

  const hasWhitelist = form.watch("hasWhitelist");

  useEffect(() => {
    if (!isConnected) {
      console.log("User is not connected. Asking to reconnect...");

      openConnectModal?.();
    }
  }, [isConnected, openConnectModal]);

  const deployContract = async (data: FormValues) => {
    if (!isConnected) {
      toast.info("Please connect your wallet before deploying.");
      openConnectModal?.();
      return;
    }

    if (!walletClient) {
      toast.error("No wallet client found. Please reconnect.");
      return;
    }

    setDeploying(true);

    try {
      let baseUri = data.baseUri;

      if (nftFile) {
        toast.info("Uploading image to IPFS...");
        baseUri = await uploadToPinata({
          name: data.name,
          description: data.description,
          file: nftFile,
        });
        toast.success("Image uploaded successfully!");
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const priceInWei = ethers.parseEther(data.price.toString());
      const whitelistPriceInWei = ethers.parseEther(
        data.whitelistPrice?.toString() ?? "0"
      );

      let merkleRoot = zeroPadBytes("0x", 32);
      if (data.hasWhitelist && data.whitelistWallets) {
        const addresses = data.whitelistWallets
          .split(",")
          .map((addr) => addr.trim());
        merkleRoot = generateMerkleRoot(addresses);
      }

      const contractABI =
        collectionType === COLLECTION_TYPE.SAME_ART
          ? sameCollectionContractABI
          : uniqueCollectionContractABI;
      const contractBytecode =
        collectionType === COLLECTION_TYPE.SAME_ART
          ? sameCollectionContractBytecode
          : uniqueCollectionContractBytecode;

      const factory = new ethers.ContractFactory(
        contractABI,
        contractBytecode,
        signer
      );

      const timestamps = {
        whitelistStart: data.whitelistStart
          ? Math.floor(data.whitelistStart.getTime() / 1000)
          : 0,
        whitelistEnd: data.whitelistEnd
          ? Math.floor(data.whitelistEnd.getTime() / 1000)
          : 0,
        publicSaleStart: data.publicSaleStart
          ? Math.floor(data.publicSaleStart.getTime() / 1000)
          : 0,
        publicSaleEnd: data.publicSaleEnd
          ? Math.floor(data.publicSaleEnd.getTime() / 1000)
          : 0,
      };

      const contract = await factory.deploy(
        data.name,
        data.symbol,
        baseUri ?? "",
        [
          data.maxTokens,
          priceInWei,
          whitelistPriceInWei,
          data.maxMintPerTx,
          data.maxMintPerWallet,
        ],
        [
          data.hasWhitelist,
          timestamps.whitelistStart,
          timestamps.whitelistEnd,
          timestamps.publicSaleStart,
          timestamps.publicSaleEnd,
        ],
        data.royaltyFee * 100,
        merkleRoot
      );

      toast.info("Transaction sent. Waiting for confirmation...");
      await contract.waitForDeployment();

      const collectionAddress = contract.target as string;
      setDeployedCollectionAddress(collectionAddress);
      setShowSuccessDialog(true);

      const collectionData: ICollection = {
        ...data,
        collectionAddress: contract.target as string,
        contractOwner: signer.address,
        type: collectionType,
        collectionImage:
          collectionImagePreview !== ""
            ? collectionImagePreview
            : collectionNFTPreview,
        whitelistWallets: data.whitelistWallets
          ? data.whitelistWallets.split(",").map((addr) => addr.trim())
          : [],
      };

      const res = await fetch("/api/collections", {
        method: "POST",
        body: JSON.stringify(collectionData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to save collection to database");
      }

      toast.success(`Collection deployed & saved successfully!`);
    } catch (error) {
      console.error("Deployment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Contract deployment failed."
      );
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="w-full px-6 lg:px-0">
      <div className="lg:max-w-2xl lg:mx-auto p-6 bg-[rgba(16,12,24,.4)] backdrop-blur-2xl shadow-lg rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-4">Deploy Your NFT Collection</h2>

        <Divider variant="horizontal" />

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(deployContract)}
          >
            <h3 className="text-xl font-bold">Collection Settings</h3>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel required>Collection Name</FormLabel>

                    <Tooltip>
                      Enter the <b>name</b> of your NFT collection (e.g.,
                      &quot;CHOG&quot;).
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="symbol"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel required>Symbol</FormLabel>
                    <Tooltip>
                      Enter the <b>ticker symbol</b> for your collection (e.g.,
                      &quot;CSPK&quot;).
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Description</FormLabel>
                    <Tooltip>
                      Write a <b>short description</b> of your NFT collection.
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter collection description"
                      maxLength={300}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CollectionImageUpload
              form={form}
              variant="default"
              imagePreview={collectionImagePreview}
              setImagePreview={setCollectionImagePreview}
            />

            <div className="grid grid-cols-2 gap-2">
              <Card
                onClick={() => setCollectionType(COLLECTION_TYPE.SAME_ART)}
                className={cn(
                  "group flex flex-col gap-2 p-4  cursor-pointer bg-[rgb(50,45,62,0.3)] hover:bg-[rgb(50,45,62,1)] transition-colors duration-200 border-0",
                  collectionType === COLLECTION_TYPE.SAME_ART && "border"
                )}
              >
                <span className="font-bold text-xl text-white">
                  Same Art Collection
                </span>
                <span className="text-gray-400">
                  Select this if you want an ERC1155 collection, where everyone
                  mints the <b>same</b> art.
                </span>
                <Image
                  src="/chog_pfp.webp"
                  width={300}
                  height={300}
                  quality={100}
                  className="w-full h-auto rounded-lg group-hover:scale-[1.02] transition-all duration-200"
                  alt="Chog PFP"
                />
              </Card>
              <Card
                onClick={() => setCollectionType(COLLECTION_TYPE.UNIQUE_ART)}
                className={cn(
                  "group flex flex-col gap-2 p-4  cursor-pointer bg-[rgb(50,45,62,0.3)] hover:bg-[rgb(50,45,62,1)] transition-colors duration-200 border-0",
                  collectionType === COLLECTION_TYPE.UNIQUE_ART && "border"
                )}
              >
                <span className="font-bold text-xl text-white">
                  Unique Art Collection
                </span>
                <span className="text-gray-400">
                  Select this if you want an ERC721 collection, where everyone
                  mints a <b>unique</b> art.
                </span>
                <Image
                  src="/unique_nft.gif"
                  width={300}
                  height={300}
                  quality={100}
                  className="w-full h-auto rounded-lg group-hover:scale-[1.02] transition-all duration-200"
                  alt="Chog PFP"
                />
              </Card>
            </div>
            {collectionType === COLLECTION_TYPE.SAME_ART ? (
              <CollectionImageUpload
                variant="uri"
                form={form}
                imagePreview={collectionNFTPreview}
                setImagePreview={setCollectionNFTPreview}
                setCollectionImageFile={setNFTFile}
              />
            ) : (
              <FormField
                name="baseUri"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <FormLabel>Base URI (IPFS URL)</FormLabel>
                        <Tooltip>
                          This is the <b>IPFS/Arweave URL</b> where NFT metadata
                          will be stored.
                        </Tooltip>
                      </div>
                      <span className="text-sm text-gray-300">
                        Check out{" "}
                        <Link
                          href="https://help.magiceden.io/en/articles/10426755-the-ultimate-guide-to-generating-uploading-and-importing-metadata-on-magic-eden-s-mint-terminal"
                          target="_blank"
                          className="font-bold underline text-blue-600"
                        >
                          this step-by-step guide
                        </Link>{" "}
                        on how to generate and upload your collection assets and
                        metadata.
                      </span>
                    </div>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Divider variant="horizontal" />

            <h3 className="text-xl font-bold">Mint Settings</h3>
            <FormField
              name="maxTokens"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel required>Max Supply</FormLabel>
                    <Tooltip>
                      The <b>maximum number</b> of NFTs that can ever be minted.
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="price"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel required>Mint Price (MON)</FormLabel>
                    <Tooltip>
                      The <b>minting cost</b> per NFT in MON. Set <b>0</b> for
                      free mints.
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input type="number" step="0.001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="maxMintPerTx"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel required>Max Mint Per Transaction</FormLabel>
                    <Tooltip>
                      The <b>maximum amount of NFTs</b> that can be minted at
                      once.
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="maxMintPerWallet"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel required>Max Mint Per Wallet</FormLabel>
                    <Tooltip>
                      The <b>maximum number of NFTs</b> a single wallet can
                      mint.
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="royaltyFee"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel required>Royalty Fee (%)</FormLabel>
                    <Tooltip>
                      Enter the <b>royalty percentage</b> (Max 9%). An
                      additional 1% is reserved for the platform.
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input type="number" step="1" min="0" max="9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Divider variant="horizontal" />

            <h3 className="text-xl font-bold">Sales Settings</h3>
            <FormField
              name="publicSaleStart"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Public Sale Start</FormLabel>
                    <Tooltip>
                      Set a start date or leave it empty to start right after
                      created(you can modify it later)
                    </Tooltip>
                  </div>
                  <DateTime field={field} />
                </FormItem>
              )}
            />

            <FormField
              name="publicSaleEnd"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Public Sale End</FormLabel>
                    <Tooltip>
                      Set a end date or leave it empty to leave it open(you can
                      modify it later)
                    </Tooltip>
                  </div>
                  <DateTime field={field} />
                </FormItem>
              )}
            />

            <FormField
              name="hasWhitelist"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <FormLabel>Enable Whitelist</FormLabel>
                    <Tooltip>
                      Enable this to restrict minting to whitelisted wallets
                      before the public sale.
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasWhitelist && (
              <>
                <FormField
                  name="whitelistStart"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Whitelist Start</FormLabel>
                        {/* <Tooltip>{tooltip}</Tooltip> */}
                      </div>
                      <DateTime field={field} />
                    </FormItem>
                  )}
                />

                <FormField
                  name="whitelistEnd"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Whitelist End</FormLabel>
                        {/* <Tooltip>{tooltip}</Tooltip> */}
                      </div>
                      <DateTime field={field} />
                    </FormItem>
                  )}
                />

                <FormField
                  name="whitelistPrice"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel required>
                          Whitelist Mint Price (MON)
                        </FormLabel>
                        <Tooltip>
                          The <b>minting cost</b> per NFT in MON for whitelisted
                          users. Set <b>0</b> for free mints.
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="whitelistWallets"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Whitelisted Wallets</FormLabel>
                        <Tooltip>
                          Enter <b>wallet addresses</b> eligible for whitelist
                          minting separated by comma.
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter wallet addresses, separated by comma"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button
              type="submit"
              className="w-full"
              variant="secondary"
              disabled={deploying}
            >
              {deploying ? "Deploying..." : "Deploy Contract"}
            </Button>
          </form>
        </Form>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl text-monad-black">
              Collection Deployed Successfully!
            </DialogTitle>
            <DialogDescription>
              Your collection has been deployed to Monad Testnet. You can now
              start minting NFTs.
            </DialogDescription>
          </DialogHeader>
          <Button variant="link" className="w-fit p-0">
            <Link
              href={`https://testnet.monadexplorer.com/address/${deployedCollectionAddress}`}
              target="_blank"
              className="flex items-center gap-1"
            >
              Open in Monad Explorer
              <SquareArrowOutUpRight size={16} />
            </Link>
          </Button>

          <Button
            className="w-full"
            onClick={() =>
              router.push(`/collections/${deployedCollectionAddress}`)
            }
          >
            View Collection
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
