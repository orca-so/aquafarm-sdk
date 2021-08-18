import {
  Connection,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { AQUAFARM_PROGRAM_ID } from "./utils/constants";
import { logTokenAccountBalances } from "./utils/accounts";
import { TestAccounts } from "./setUpAccounts";
import { constructHarvestIx } from "../src/instructions";

export default async function harvestRewards(
  connection: Connection,
  testAccounts: TestAccounts
) {
  const {
    userFarmOwner,
    globalFarm,
    userFarm,
    globalBaseTokenVaultPubkey,
    globalRewardTokenVaultPubkey,
    userRewardTokenAccountPubkey,
    aquafarmPda,
  } = testAccounts;

  const transaction = new Transaction({
    feePayer: userFarmOwner.publicKey,
  });

  transaction.add(
    constructHarvestIx(
      userFarmOwner.publicKey,
      userRewardTokenAccountPubkey,
      globalBaseTokenVaultPubkey,
      globalFarm,
      userFarm,
      globalRewardTokenVaultPubkey,
      aquafarmPda,
      AQUAFARM_PROGRAM_ID
    )
  );

  async function logAmounts() {
    await logTokenAccountBalances(connection, [
      [userRewardTokenAccountPubkey, "User's Reward Vault"],
      [globalRewardTokenVaultPubkey, "Reward Vault"],
    ]);
    console.log("");
  }

  console.log("--- HARVEST ---");
  console.log("");

  console.log("PRE-TX BALANCES");
  await logAmounts();

  const txid = await sendAndConfirmTransaction(connection, transaction, [
    userFarmOwner,
  ]);

  console.log("txid", txid);

  console.log("POST-TX BALANCES");
  await logAmounts();
}
