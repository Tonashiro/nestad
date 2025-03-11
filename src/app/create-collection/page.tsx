"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ethers, zeroPadBytes } from "ethers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { contractABI, contractBytecode } from "@/constants";
import { generateMerkleRoot } from "@/utils";
import { ICollection } from "@/types";
import { CollectionImageUpload } from "@/components/CollectionImageUpload";

export type FormValues = z.infer<typeof CreateCollectionSchema>;

export default function CreateCollection() {
  const [deploying, setDeploying] = useState(false);
  const [collectionImage, setCollectionImage] = useState("");
  const { data: walletClient } = useWalletClient();

  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateCollectionSchema),
    defaultValues: {
      name: "",
      symbol: "",
      baseUri: "",
      description: "",
      collectionImage: "",
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
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      console.log("signer", signer);
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
        data.baseUri ?? "",
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

      const collectionData: ICollection = {
        ...data,
        collectionAddress: contract.target as string,
        contractOwner: signer.address,
        collectionImage: collectionImage,
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
              collectionImage={collectionImage}
              setCollectionImage={setCollectionImage}
            />

            <FormField
              name="baseUri"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Base URI (IPFS URL)</FormLabel>
                    <Tooltip>
                      This is the <b>IPFS/Arweave URL</b> where NFT metadata
                      will be stored.
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
    </div>
  );
}
