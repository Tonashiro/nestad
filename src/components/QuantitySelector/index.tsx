"use client";

import { Button } from "@/components/ui/button";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface QuantitySelectorProps {
  max: number;
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
}

/**
 * A component that allows users to select the quantity of NFTs to mint,
 * with controls to increment and decrement the value within the allowed range.
 *
 * @component
 * @example
 * ```tsx
 * <QuantitySelector
 *   maxMintPerTx={5}
 *   value={amount}
 *   onChange={setAmount}
 * />
 * ```
 */
export const QuantitySelector = ({
  max,
  amount,
  setAmount,
}: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (amount > 1) {
      setAmount(amount - 1);
    }
  };

  const handleIncrease = () => {
    if (amount < max) {
      setAmount(amount + 1);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        onClick={handleDecrease}
        disabled={amount <= 1}
        className="w-10 h-10"
      >
        <MinusCircleIcon size={16} />
      </Button>
      <span className="w-10 text-center text-lg font-semibold">{amount}</span>
      <Button
        variant="secondary"
        onClick={handleIncrease}
        disabled={amount >= max}
        className="w-10 h-10 "
      >
        <PlusCircleIcon size={16} />
      </Button>
    </div>
  );
};
