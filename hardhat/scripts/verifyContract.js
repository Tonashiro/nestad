// eslint-disable-next-line @typescript-eslint/no-require-imports
const { exec } = require("child_process");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Error: Please provide a contract address.");
  process.exit(1);
}

const contractAddress = args[0];

console.log(`🔍 Verifying contract at address: ${contractAddress}`);

exec(
  `npx hardhat verify ${contractAddress} --network monadTestnet`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Warning: ${stderr}`);
    }
    console.log(`✅ Verification successful: ${stdout}`);
  }
);
