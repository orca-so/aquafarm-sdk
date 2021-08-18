import { u64 } from "@solana/spl-token";
import BN from "bn.js";

export function toBNWithDecimals(amount: number, decimals = 9): BN {
  const base = new u64(10).pow(new u64(decimals));

  // Break up into the integer and fractional part of the number
  const integersAsNumber = Math.floor(amount);
  const fractionsAsNumber = amount % 1;

  // Convert each into a u64 multiplied by 10^{decimals}
  const integersAsU64 = new u64(integersAsNumber).mul(base);

  if (!fractionsAsNumber) {
    return integersAsU64;
  }

  const fractionsAsU64 = new u64(
    fractionsAsNumber.toString().substring(0, decimals).padEnd(decimals, "0")
  );

  // Add them up. This results in a BN, so it needs to be converted to u64 again
  return integersAsU64.add(fractionsAsU64);
}

export function toU64WithDecimals(amount: number, decimals = 9): u64 {
  const result = toBNWithDecimals(amount, decimals);
  return new u64(result);
}

export const ZERO = new u64(0);
