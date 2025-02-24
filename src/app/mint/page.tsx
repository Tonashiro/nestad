"use client";

import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../artifacts/Nestad.json";

export default function MintNFT() {
  const [contractAddress, setContractAddress] = useState("");
  const [minting, setMinting] = useState(false);
  const [amount, setAmount] = useState(1);

  const mintNFT = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required");
      return;
    }

    setMinting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI.abi,
        signer
      );

      const totalCost =  BigInt(amount);

      const tx = await contract.publicMint(amount, { value: totalCost });
      await tx.wait();

      alert("NFT Minted Successfully!");
    } catch (error) {
      console.error("Minting error:", error);
    }
    setMinting(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Mint Your NFT</h2>
      <input
        placeholder="Contract Address"
        onChange={(e) => setContractAddress(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value as unknown as number)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={mintNFT}
        disabled={minting}
        className="w-full bg-green-600 text-white p-2 rounded"
      >
        {minting ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  );
}
