import { Token, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";

import {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { AQUAFARM_PROGRAM_ID } from "./utils/constants";
import { logTokenAccountBalances } from "./utils/accounts";
import { TestAccounts } from "./setUpAccounts";
import { constructRevertTokensIx } from "../src/instructions";

export default async function revertTokens(
  connection: Connection,
  testAccounts: TestAccounts,
  amountToRevert = 20 // without the decimals
) {
  const {
    userFarmOwner,
    globalBaseTokenVaultPubkey,
    userBaseTokenAccountPubkey,
    userFarmTokenAccountPubkey,
    userRewardTokenAccountPubkey,
    userFarm,
    globalRewardTokenVaultPubkey,
    globalFarm,
    farmTokenMint,
    aquafarmPda,
  } = testAccounts;

  const amountWithDecimals = new u64(amountToRevert * Math.pow(10, 9));

  console.log(`Amount with decimals: ${amountWithDecimals.toString()}`);

  const userBurnAuthority = new Keypair();

  const transaction = new Transaction({
    feePayer: userFarmOwner.publicKey,
  });

  transaction.add(
    Token.createApproveInstruction(
      farmTokenMint.programId,
      userFarmTokenAccountPubkey,
      userBurnAuthority.publicKey,
      userFarmOwner.publicKey,
      [],
      amountWithDecimals
    )
  );

  transaction.add(
    constructRevertTokensIx(
      userFarmOwner.publicKey,
      userBurnAuthority.publicKey,
      userBaseTokenAccountPubkey,
      userFarmTokenAccountPubkey,
      userRewardTokenAccountPubkey,
      globalBaseTokenVaultPubkey,
      farmTokenMint.publicKey,
      globalFarm,
      userFarm,
      globalRewardTokenVaultPubkey,
      aquafarmPda,
      AQUAFARM_PROGRAM_ID,
      amountWithDecimals
    )
  );

  async function logAmounts() {
    await logTokenAccountBalances(connection, [
      [userBaseTokenAccountPubkey, "Source base token account"],
      [globalBaseTokenVaultPubkey, "Global base token vault"],
      [userFarmTokenAccountPubkey, "User's farm token account"],
    ]);
    console.log("");
  }

  console.log(`--- REVERT ${amountToRevert} TOKENS ---`);
  console.log("");

  console.log("PRE-TX BALANCES");
  await logAmounts();

  await sendAndConfirmTransaction(connection, transaction, [
    userFarmOwner,
    userBurnAuthority,
  ]);

  console.log("POST-TX BALANCES");
  await logAmounts();
}
