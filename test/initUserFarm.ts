import {
  Connection,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { constructInitUserFarmIx } from "../src/instructions";
import { TestAccounts } from "./setUpAccounts";
import { AQUAFARM_PROGRAM_ID } from "./utils/constants";

export default async function initUserFarm(
  connection: Connection,
  testAccounts: TestAccounts
) {
  const { userFarmOwner, globalFarm, userFarm } = testAccounts;

  const transaction = new Transaction({
    feePayer: userFarmOwner.publicKey,
  });

  console.log(
    "Creating the userFarmState account with the following pubkey: ",
    userFarm.toBase58()
  );

  transaction.add(
    constructInitUserFarmIx(
      globalFarm,
      userFarm,
      userFarmOwner.publicKey,
      AQUAFARM_PROGRAM_ID
    )
  );

  const txid = await sendAndConfirmTransaction(connection, transaction, [
    userFarmOwner,
  ]);

  console.log("txid:", txid);

  console.log("Created the userFarmState account on the blockchain");

  return userFarm;
}
