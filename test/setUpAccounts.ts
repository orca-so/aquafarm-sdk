import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  getAuthorityAndNonce,
  getGlobalFarmAddress,
} from "../src/models/GlobalFarm";
import { getUserFarmAddress } from "../src/models/UserFarm";
import { newKeypairWithLamports } from "./utils/accounts";

import { AQUAFARM_PROGRAM_ID } from "./utils/constants";

export type TestAccounts = {
  ownerKeypair: Keypair;
  emissionsAuthority: Keypair;
  removeRewardsAuthority: Keypair;
  baseTokenMint: Token;
  globalBaseTokenVaultPubkey: PublicKey;
  farmTokenMint: Token;
  rewardTokenMint: Token;
  globalRewardTokenVaultPubkey: PublicKey;
  sourceRewardAccountPubkey: PublicKey;
  destRewardAccountPubkey: PublicKey;
  userFarmOwner: Keypair;
  userFarm: PublicKey;
  userBaseTokenAccountPubkey: PublicKey;
  userFarmTokenAccountPubkey: PublicKey;
  userRewardTokenAccountPubkey: PublicKey;
  globalFarm: PublicKey;
  aquafarmPda: PublicKey;
  nonce: number;
};

export default async function setUpAccounts(
  connection: Connection,
  ownerKeypair?: Keypair,
  emissionsAuthority?: Keypair,
  removeRewardsAuthority?: Keypair,
  baseTokenMintPubkey?: PublicKey,
  rewardTokenMintPubkey?: PublicKey
) {
  async function mintToken(
    payer: Keypair,
    mintAuthority: PublicKey,
    decimals = 9
  ) {
    return await Token.createMint(
      connection,
      payer,
      mintAuthority,
      null,
      decimals,
      TOKEN_PROGRAM_ID
    );
  }

  if (!ownerKeypair) {
    ownerKeypair = await newKeypairWithLamports(connection);
  }
  if (!emissionsAuthority) {
    emissionsAuthority = await newKeypairWithLamports(connection);
  }
  if (!removeRewardsAuthority) {
    removeRewardsAuthority = await newKeypairWithLamports(connection);
  }
  const userFarmOwner = await newKeypairWithLamports(connection); // Represents a random LP who will be harvesting rewards

  // Create accounts to pass in
  let baseTokenMint: Token;
  if (!baseTokenMintPubkey) {
    baseTokenMint = await mintToken(ownerKeypair, ownerKeypair.publicKey);
  } else {
    baseTokenMint = new Token(
      connection,
      baseTokenMintPubkey,
      TOKEN_PROGRAM_ID,
      ownerKeypair
    );
  }

  let rewardTokenMint: Token;
  if (!rewardTokenMintPubkey) {
    rewardTokenMint = await mintToken(ownerKeypair, ownerKeypair.publicKey);
  } else {
    rewardTokenMint = new Token(
      connection,
      rewardTokenMintPubkey,
      TOKEN_PROGRAM_ID,
      ownerKeypair
    );
  }

  const [globalFarm] = await getGlobalFarmAddress(
    baseTokenMint.publicKey,
    rewardTokenMint.publicKey,
    ownerKeypair.publicKey,
    TOKEN_PROGRAM_ID,
    AQUAFARM_PROGRAM_ID
  );

  const [aquafarmPda, nonce] = await getAuthorityAndNonce(
    globalFarm,
    AQUAFARM_PROGRAM_ID
  );

  const globalBaseTokenVaultPubkey = await baseTokenMint.createAccount(
    aquafarmPda
  );

  const globalRewardTokenVaultPubkey = await rewardTokenMint.createAccount(
    aquafarmPda
  );

  const sourceRewardAccountPubkey = await rewardTokenMint.createAccount(
    ownerKeypair.publicKey
  );

  console.log("Minting reward tokens...");

  const amountToMint = 500 * Math.pow(10, 9);

  // Add some reward tokens to transfer to the global rewards vault
  await rewardTokenMint.mintTo(
    sourceRewardAccountPubkey,
    ownerKeypair,
    [],
    amountToMint
  );

  console.log(
    `minted ${
      amountToMint / Math.pow(10, 9)
    } reward tokens to the authority's reward token ATA`
  );

  const destRewardAccountPubkey = await rewardTokenMint.createAccount(
    removeRewardsAuthority.publicKey
  );

  const farmTokenMint = await mintToken(ownerKeypair, aquafarmPda);

  const userBaseTokenAccountPubkey = await baseTokenMint.createAccount(
    userFarmOwner.publicKey
  );

  if (!baseTokenMintPubkey) {
    await baseTokenMint.mintTo(
      userBaseTokenAccountPubkey,
      ownerKeypair,
      [],
      45 * Math.pow(10, 9)
    );
  }

  const userFarmTokenAccountPubkey = await farmTokenMint.createAccount(
    userFarmOwner.publicKey
  );

  const userRewardTokenAccountPubkey = await rewardTokenMint.createAccount(
    userFarmOwner.publicKey
  );

  const userFarm = (
    await getUserFarmAddress(
      globalFarm,
      userFarmOwner.publicKey,
      TOKEN_PROGRAM_ID,
      AQUAFARM_PROGRAM_ID
    )
  )[0];

  const testAccounts: TestAccounts = {
    ownerKeypair,
    emissionsAuthority,
    removeRewardsAuthority,
    userFarmOwner,
    userFarm,
    userBaseTokenAccountPubkey,
    userFarmTokenAccountPubkey,
    userRewardTokenAccountPubkey,
    baseTokenMint,
    globalBaseTokenVaultPubkey,
    farmTokenMint,
    rewardTokenMint,
    globalRewardTokenVaultPubkey,
    sourceRewardAccountPubkey,
    destRewardAccountPubkey,
    globalFarm,
    aquafarmPda,
    nonce,
  };

  return testAccounts;
}
