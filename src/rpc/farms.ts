import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import GlobalFarm, { getAuthorityAndNonce } from "../models/GlobalFarm";
import { decodeGlobalFarmBuffer, decodeUserFarmBuffer } from "../utils/layout";
import UserFarm from "../models/UserFarm";
import { getUserFarmAddress } from "../models/UserFarm";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function fetchBatchedAccountInfos(
  connection: Connection,
  pubkeys: PublicKey[]
): Promise<(AccountInfo<Buffer> | null)[]> {
  return connection.getMultipleAccountsInfo(pubkeys, "singleGossip");
}

/**
 *
 * @param connection A Solana RPC connection
 * @param farmPubkeys The public keys for the GlobalFarm accounts
 * @returns An array of GlobalFarm models
 */
export async function fetchGlobalFarms(
  connection: Connection,
  farmPubkeys: PublicKey[],
  programId: PublicKey
): Promise<GlobalFarm[]> {
  const accountInfos = await fetchBatchedAccountInfos(connection, farmPubkeys);

  return Promise.all(
    accountInfos.map(
      async (accountInfo: AccountInfo<Buffer> | null, i: number) => {
        if (!accountInfo) {
          throw new Error("GlobalFarm not found");
        }

        const decoded = decodeGlobalFarmBuffer(accountInfo);
        const publicKey = farmPubkeys[i];
        const authority = (await getAuthorityAndNonce(publicKey, programId))[0];
        return new GlobalFarm({
          ...decoded,
          publicKey,
          authority,
        });
      }
    )
  );
}

/**
 *
 * @param connection A Solana RPC connection
 * @param userPubkey The user's SOL address (UserFarm.owner)
 * @param farmPubkeys The public keys for the GlobalFarm accounts for which to fetch UserFarm accounts
 * @returns An array of GlobalFarm models
 */
export async function fetchUserFarms(
  connection: Connection,
  userPubkey: PublicKey,
  farmPubkeys: PublicKey[],
  programId: PublicKey
): Promise<(UserFarm | null)[]> {
  const addresses: PublicKey[] = await Promise.all(
    farmPubkeys.map(async (globalFarmPubkey): Promise<PublicKey> => {
      return (
        await getUserFarmAddress(
          globalFarmPubkey,
          userPubkey,
          TOKEN_PROGRAM_ID,
          programId
        )
      )[0];
    })
  );

  const accountInfos = await fetchBatchedAccountInfos(connection, addresses);

  return accountInfos.map(
    (accountInfo: AccountInfo<Buffer> | null, i: number) => {
      if (!accountInfo) {
        return null;
      }

      const decoded = decodeUserFarmBuffer(accountInfo);
      return new UserFarm({ ...decoded, publicKey: addresses[i] });
    }
  );
}
