/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function Portfolio() {
  const [address, setAddress] = useState("");
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Filter states
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Extract unique collections from fetched NFTs
  const uniqueCollections = useMemo(() => {
    const collections = new Set(nfts.map((nft) => nft.contractName));
    return Array.from(collections);
  }, [nfts]);

  const fetchNFTs = async (cursor = "") => {
    if (!address) {
      setError("Please enter a wallet address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/getNFTs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, cursor }),
      });

      const data = await res.json();

      if (data?.nfts?.length > 0) {
        const newNfts = data.nfts.map((nft: any) => {
          // Get last sale price
          const sale = nft.last_sale || nft.primary_sale;
          const lastSalePrice = sale ? sale.unit_price / 10 ** 18 : null; // Convert from Wei
          const currency = sale?.payment_token?.symbol || "MON";

          // Get floor price (lowest listing in the collection)
          const floorPriceEntry = nft.collection?.floor_prices?.[0];
          const floorPrice = floorPriceEntry
            ? floorPriceEntry.amount / 10 ** 18
            : null;
          const floorCurrency = floorPriceEntry?.payment_token?.symbol || "MON";

          return {
            name: nft.name || `Token #${nft.token_id}`,
            contractName: nft.collection?.name || "Unknown Collection",
            contractAddress: nft.contract_address,
            tokenId: nft.token_id,
            image:
              nft.image_url ||
              nft.previews?.image_medium_url ||
              "/nft_placeholder.webp",
            price: floorPrice
              ? floorPrice
              : lastSalePrice
                ? lastSalePrice
                : null,
            priceLabel: floorPrice
              ? `Floor: ${floorPrice} ${floorCurrency}`
              : lastSalePrice
                ? `Last Sale: ${lastSalePrice} ${currency}`
                : "No price data",
          };
        });

        setNfts(cursor ? [...nfts, ...newNfts] : newNfts);
        setNextCursor(data.next_cursor || null);
      } else {
        if (!cursor) setNfts([]);
        setError("No NFTs found.");
      }
    } catch (err) {
      setError("Failed to fetch NFTs.");
      console.error(err);
    }

    setLoading(false);
  };

  // Apply filters and sorting
  const filteredAndSortedNFTs = useMemo(() => {
    let filtered = nfts;

    if (selectedCollection && selectedCollection !== "all") {
      filtered = filtered.filter(
        (nft) => nft.contractName === selectedCollection,
      );
    }

    return filtered.sort((a, b) =>
      sortOrder === "asc"
        ? (a.price || 0) - (b.price || 0)
        : (b.price || 0) - (a.price || 0),
    );
  }, [nfts, selectedCollection, sortOrder]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Monad NFT Portfolio</h1>

      <div className="flex space-x-2 mb-6">
        <Input
          placeholder="Wallet Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-64"
        />
        <Button onClick={() => fetchNFTs()} disabled={loading}>
          {loading ? "Loading..." : "Fetch NFTs"}
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Filter Options */}
      <div className="flex space-x-4 mb-4">
        {/* Collection Dropdown */}
        <Select onValueChange={setSelectedCollection} defaultValue="all">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Collections</SelectItem>
            {uniqueCollections.map((collection, index) => (
              <SelectItem key={index} value={collection}>
                {collection}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Sorting */}
        <Select
          onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          defaultValue="desc"
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Price: High to Low</SelectItem>
            <SelectItem value="asc">Price: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {filteredAndSortedNFTs.length > 0 &&
          filteredAndSortedNFTs.map((nft, index) => (
            <Card key={index} className="shadow-md">
              <CardContent className="p-4">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  height={200}
                  width={200}
                  className="w-full h-48 object-cover rounded-md"
                  onError={(e) =>
                    (e.currentTarget.src = "/nft_placeholder.webp")
                  }
                />
                <h2 className="text-lg font-semibold mt-2">{nft.name}</h2>
                <p className="text-sm text-gray-600">{nft.contractName}</p>
                <p className="text-xs text-gray-500">
                  Contract: {nft.contractAddress}
                </p>
                <p className="text-xs text-gray-500">Token ID: {nft.tokenId}</p>
                <p className="text-xs text-blue-600 font-bold">
                  {nft.priceLabel}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Pagination Button */}
      {nextCursor && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => fetchNFTs(nextCursor)}
        >
          Load More NFTs
        </Button>
      )}
    </div>
  );
}
