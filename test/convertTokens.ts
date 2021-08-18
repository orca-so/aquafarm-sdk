import { Token, u64 } from "@solana/spl-token";

import {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { AQUAFARM_PROGRAM_ID } from "./utils/constants";
import { logTokenAccountBalances } from "./utils/accounts";
import { TestAccounts } from "./setUpAccounts";
import { constructConvertTokensIx } from "../src/instructions";

export default async function convertTokens(
  connection: Connection,
  testAccounts: TestAccounts,
  amountToConvert = 40 // without the decimals
) {
  const {
    userFarmOwner,
    globalBaseTokenVaultPubkey,
    userBaseTokenAccountPubkey,
    userFarmTokenAccountPubkey,
    userFarm,
    globalRewardTokenVaultPubkey,
    userRewardTokenAccountPubkey,
    globalFarm,
    aquafarmPda,
    farmTokenMint,
  } = testAccounts;

  const amountWithDecimals = new u64(amountToConvert * Math.pow(10, 9));

  console.log(`Amount with decimals: ${amountWithDecimals.toString()}`);

  const userTransferAuthority = new Keypair();
  const transaction = new Transaction({
    feePayer: userFarmOwner.publicKey,
  });

  transaction.add(
    Token.createApproveInstruction(
      farmTokenMint.programId,
      userBaseTokenAccountPubkey,
      userTransferAuthority.publicKey,
      userFarmOwner.publicKey,
      [],
      amountWithDecimals
    )
  );

  transaction.add(
    constructConvertTokensIx(
      userFarmOwner.publicKey,
      userTransferAuthority.publicKey,
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
      [userFarmTokenAccountPubkey, "Dest farm token account"],
    ]);
    console.log("");
  }

  console.log(`--- CONVERT ${amountToConvert} TOKENS ---`);
  console.log("");

  console.log("PRE-TX BALANCES");
  await logAmounts();

  await sendAndConfirmTransaction(connection, transaction, [
    userFarmOwner, // for approval and transfer
    userTransferAuthority, // for transfer
  ]);

  console.log("POST-TX BALANCES");
  await logAmounts();
}
