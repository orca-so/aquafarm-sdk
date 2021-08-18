import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SOLANA_URL } from "./utils/constants";
import setUpAccounts from "./setUpAccounts";
import initGlobalFarm from "./initGlobalFarm";
import setEmissionsPerSecond from "./setEmissionsPerSecond";
import addRewards from "./addRewards";
import { readFile } from "mz/fs";
import prompts from "prompts";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function getKeypair(keyPath: string): Promise<Keypair> {
  const secretKey = Buffer.from(
    JSON.parse(await readFile(keyPath, { encoding: "utf-8" }))
  );
  return Keypair.fromSecretKey(secretKey);
}

async function run() {
  const connection = new Connection(SOLANA_URL, "singleGossip");

  const { ownerKeypairPath } = await prompts({
    type: "text",
    name: "ownerKeypairPath",
    message: "Enter path to owner private key",
  });

  const { emissionsAuthorityPath } = await prompts({
    type: "text",
    name: "emissionsAuthorityPath",
    message: "Enter path to emissions authority private key",
  });

  const { removeRewardsAuthorityPath } = await prompts({
    type: "text",
    name: "removeRewardsAuthorityPath",
    message: "Enter path to remove rewards authority private key",
  });

  const baseTokenMintPubkey = new PublicKey(
    (
      await prompts({
        type: "text",
        name: "publicKey",
        message: "Enter base token mint public key",
      })
    ).publicKey
  );

  const rewardTokenMintPubkey = new PublicKey(
    (
      await prompts({
        type: "text",
        name: "publicKey",
        message: "Enter reward token mint public key",
      })
    ).publicKey
  );

  const ownerKeypair = await getKeypair(ownerKeypairPath);
  const emissionsAuthority = await getKeypair(emissionsAuthorityPath);
  const removeRewardsAuthority = await getKeypair(removeRewardsAuthorityPath);

  const testAccounts = await setUpAccounts(
    connection,
    ownerKeypair,
    emissionsAuthority,
    removeRewardsAuthority,
    baseTokenMintPubkey,
    rewardTokenMintPubkey
  );

  await initGlobalFarm(connection, testAccounts);
  await setEmissionsPerSecond(connection, testAccounts);
  await addRewards(connection, testAccounts);

  const {
    globalFarm,
    nonce,
    globalBaseTokenVaultPubkey,
    globalRewardTokenVaultPubkey,
    farmTokenMint,
  } = testAccounts;

  const output = {
    account: globalFarm.toBase58(),
    nonce: nonce,
    tokenProgramId: TOKEN_PROGRAM_ID.toBase58(),
    emissionsAuthority: emissionsAuthority.publicKey.toBase58(),
    removeRewardsAuthority: removeRewardsAuthority.publicKey.toBase58(),
    baseTokenMint: baseTokenMintPubkey.toBase58(),
    baseTokenVault: globalBaseTokenVaultPubkey.toBase58(),
    rewardTokenMint: rewardTokenMintPubkey.toBase58(),
    rewardTokenVault: globalRewardTokenVaultPubkey.toBase58(),
    farmTokenMint: farmTokenMint.publicKey.toBase58(),
  };

  console.log(JSON.stringify(output, null, 2));
}

run()
  .then(() => {
    console.log("--- SUCCESS! ---");
  })
  .catch((e) => {
    console.error(e);
  });
