import { Connection, Keypair, PublicKey } from "@solana/web3.js";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function newKeypairWithLamports(
  connection: Connection,
  lamports = 100000000
): Promise<Keypair> {
  const keypair = new Keypair();

  let retries = 30;
  await connection.requestAirdrop(keypair.publicKey, lamports);
  for (;;) {
    await sleep(500);
    if (lamports == (await connection.getBalance(keypair.publicKey))) {
      return keypair;
    }
    if (--retries <= 0) {
      break;
    }
  }
  throw new Error(`Airdrop of ${lamports} failed`);
}

export async function logTokenAccountBalances(
  connection: Connection,
  pubkeys: [PublicKey, string][]
) {
  await Promise.all(
    pubkeys.map((key) =>
      connection
        .getTokenAccountBalance(key[0])
        .then((balance) => console.log(`${key[1]}: ${balance.value.uiAmount}`))
    )
  );
}
