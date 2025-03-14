# 🚀 Nestad

**Nestad** is an intuitive platform designed to make launching **NFT collections** effortless and enjoyable. With a sleek UI and seamless UX, it empowers users to easily create, customize, and deploy their NFT collections without the need for technical expertise.

---

## 📌 Features

- **NFT Collection Deployment** – Create and deploy ERC-721 & ERC-1155 collections with ease.
- **Whitelist & Public Minting** – Supports both whitelist and public sale minting.
- **Pinata Integration** – Upload NFT images & metadata directly to **IPFS** via **Pinata**.
- **Merkle Tree Whitelisting** – Secure & gas-efficient whitelist verification.
- **Custom Royalties** – Define royalties and ensure marketplace compatibility.
- **Wallet Integration** – Supports **MetaMask**, **RainbowKit**, and **Wagmi**.
- **Blockchain Interaction** – Uses **ethers.js** for smart contract interactions.
- **SEO Optimized** – Improved performance & visibility with **Next.js Metadata API**.
- **Vercel Analytics & Speed Insights** – Integrated for monitoring performance.

---

## 🛠 Tech Stack

Nestad is built using **modern Web3 & Web2 technologies**:

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Blockchain:** Solidity, Hardhat, Ethers.js
- **Storage:** Pinata (IPFS)
- **State Management:** React Query (TanStack) and React Context
- **Wallet Integration:** Wagmi, RainbowKit
- **Database:** MongoDB (via Mongoose)
- **API:** Next.js API Routes
- **Security:** ReentrancyGuard, OpenZeppelin Libraries

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or NPM
- MetaMask Wallet
- MongoDB Database (for storing collections)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Tonashiro/nestad.git
   cd nestad
   ```
  
2. **Install dependencies:**
   ```sh
   yarn install
   ```

3. **Set up environment variables:**
  - Create a `.env.local` file in the root directory.
  - Add the following values:
    ```env
    NEXT_PUBLIC_SH_API_KEY=your SimpleHash API Key
    NEXT_PUBLIC_SH_API_BASE_URL=SimpleHash API base url
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your wallet connect project id
    MONGODB_URI=your_mongo_connection_string
    NEXT_PUBLIC_API_URL=api url, if local http://localhost:3000
    PINATA_JWT=your_pinata_jwt
    NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway
    NEXT_PUBLIC_RPC_URL=https://your_rpc_provider
    ```
  
4. **Run the development server:**
    ```sh
    yarn dev
    ```

5. **Open http://localhost:3000 in your browser.**

---

## 📂 Project Structure

  ```bash
      /nestad
      ├── /public              # Static assets (favicons, images)
      ├── /src
      │   ├── /app             # Next.js pages & API routes
      │   ├── /components      # UI components
      │   ├── /constants       # Contract ABIs & constants
      │   ├── /context         # React context providers
      │   ├── /hooks           # Custom React hooks
      │   ├── /services        # API services (Pinata, Smart Contracts, Server)
      │   ├── /types           # TypeScript types & interfaces
      │   ├── /utils           # Helper functions
      ├── .env                 # Environment variables
      ├── hardhat.config.ts    # Hardhat configuration
      ├── next.config.js       # Next.js config
      ├── tsconfig.json        # TypeScript config
      ├── tailwind.config.js   # Tailwind CSS config
      ├── README.md            # Project documentation
  ```

---

## 🔗 API Endpoints

### **NFT Collection Management**

| Method | Endpoint               | Description                 |
|--------|------------------------|-----------------------------|
| **POST** | `/api/collections`    | Create a new NFT collection |
| **GET**  | `/api/collections`    | Retrieve all collections    |
| **GET**  | `/api/collections/:id` | Get a specific collection  |
| **GET**  | `/api/getNFTs` | Get user Monad NFTs  |
| **GET**  | `/api/getWhitelistProof` | Generate proof to validate if user is whitelisted or not  |

### **Pinata Integration**

| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| **POST** | `/api/pinata/upload`   | Upload files to Pinata    |

---

## 🚀 Deployment
#### Deploying Smart Contracts (Hardhat)
To deploy the smart contracts, we will use ignition. You can simply run the command:
  ```sh
    npx hardhat ignition deploy ignition/modules/Nestad1155.ts --network monadTestnet
  ```

You can modify the contract parameters as well, you can go to `/hardhat/ignition/modules` and access the contract you want to deploy, update the fields and run the command again.

##### NOTE: modify the path on the script above, according to the contract you want to deploy

---

## 🏗 Development Guidelines

- Follow the Atomic Design pattern for components.
- Use TypeScript for type safety and maintainability.
- Format code with Prettier before committing.
- Use environment variables instead of hardcoded API keys.
- Test contracts on Testnet before deploying on Mainnet.

---

## 📜 License
This project is licensed under the MIT License.

## ✨ Contributors
##### @Tonashiro - Creator & Developer
Feel free to contribute by opening a PR! 🚀