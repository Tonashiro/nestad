/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import contractABI from "../../artifacts/Nestad.json";
import { Addressable, ethers } from "ethers";

export default function DeployContract() {
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    baseUri: "",
    maxTokens: "",
    price: "",
    maxMintPerTx: "",
    maxMintPerWallet: "",
    hasWhitelist: false,
    whitelistStart: "",
    whitelistEnd: "",
    publicSaleStart: "",
    publicSaleEnd: "",
  });

  const [deploying, setDeploying] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | Addressable>(
    ""
  );

  const contractBytecode = process.env.NEXT_PUBLIC_CONTRACT_BYTECODE;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const deployContract = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required");
      return;
    }

    setDeploying(true);
    try {
      // Use Sepolia RPC
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const priceInWei = ethers.parseEther(form.price.toString());

      const factory = new ethers.ContractFactory(
        contractABI.abi as any,
        contractBytecode as string,
        signer
      );

      const contract = await factory.deploy(
        form.name,
        form.symbol,
        form.baseUri,
        [
          Number(form.maxTokens),
          priceInWei,
          Number(form.maxMintPerTx),
          Number(form.maxMintPerWallet),
        ],
        [
          form.hasWhitelist,
          Number(form.whitelistStart) || 0,
          Number(form.whitelistEnd) || 0,
          Number(form.publicSaleStart) || 0,
          Number(form.publicSaleEnd) || 0,
        ]
      );

      await contract.waitForDeployment();
      setContractAddress(contract.target);
      console.log("Contract deployed at:", contract.target);
    } catch (error) {
      console.error("Deployment error:", error);
    }
    setDeploying(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">
        Deploy Your NFT Collection
      </h2>
      <form className="space-y-4">
        <input
          name="name"
          placeholder="Collection Name"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="symbol"
          placeholder="Symbol"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="baseUri"
          placeholder="Base URI (IPFS URL)"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="maxTokens"
          type="number"
          placeholder="Max Tokens"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="price"
          type="number"
          step="0.001"
          placeholder="Mint Price (ETH)"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="maxMintPerTx"
          type="number"
          placeholder="Max Mint Per Transaction"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="maxMintPerWallet"
          type="number"
          placeholder="Max Mint Per Wallet"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <div>
          <input
            type="checkbox"
            name="hasWhitelist"
            id="hasWhitelist"
            onChange={handleChange}
          />
          <label htmlFor="hasWhitelist" className="ml-2">
            Enable Whitelist
          </label>
        </div>

        {form.hasWhitelist && (
          <>
            <input
              name="whitelistStart"
              type="number"
              placeholder="Whitelist Start (Unix Time)"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="whitelistEnd"
              type="number"
              placeholder="Whitelist End (Unix Time)"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </>
        )}

        <input
          name="publicSaleStart"
          type="number"
          placeholder="Public Sale Start (Unix Time)"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="publicSaleEnd"
          type="number"
          placeholder="Public Sale End (Unix Time)"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="button"
          onClick={deployContract}
          disabled={deploying}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {deploying ? "Deploying..." : "Deploy Contract"}
        </button>
      </form>

      {contractAddress && (
        <div className="mt-4 p-4 bg-green-100 border border-green-500 rounded">
          <p>Contract Deployed At:</p>
          <a
            href={`https://explorer.testnet.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {String(contractAddress)}
          </a>
        </div>
      )}
    </div>
  );
}
