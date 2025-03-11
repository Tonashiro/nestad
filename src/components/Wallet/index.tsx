import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Wallet: React.FC = () => {
  return (
    <div className="flex w-full justify-end p-6">
      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
      />
    </div>
  );
};
