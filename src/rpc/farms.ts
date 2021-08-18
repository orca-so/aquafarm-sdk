import { AccountInfo, PublicKey } from "@solana/web3.js";
import { ConnectionInternal } from "../utils/types";
import GlobalFarm, { getAuthorityAndNonce } from "../models/GlobalFarm";
import { decodeGlobalFarmBuffer, decodeUserFarmBuffer } from "../utils/layout";
import UserFarm from "../models/UserFarm";
import { getUserFarmAddress } from "../models/UserFarm";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function fetchBatchedAccountInfos(
  connection: ConnectionInternal,
  pubkeys: PublicKey[]
): Promise<AccountInfo<Buffer>[] | null> {
  const requests = pubkeys.map((pubkey) => ({
    methodName: "getAccountInfo",

    // Passing "jsonParsed" as the encoding allows the address to be treated as a base58 string
    args: connection._buildArgs(
      [pubkey.toBase58()],
      "singleGossip",
      "jsonParsed"
    ),
  }));

  const results: any = await connection._rpcBatchRequest(requests);

  return (
    results
      // Convert from RPC request response to AccountInfo<Buffer>
      .map((res: any) =>
        res.result.value
          ? Object.assign({}, res.result.value, {
              // This Buffer conversion is based on
              // https://github.com/solana-labs/solana-web3.js/blob/master/src/connection.ts#L57
              // Below, data[0] is the actual data, data[1] is the format (base64)
              data: Buffer.from(res.result.value.data[0], "base64"),
            })
          : null
      )
  );
}

/**
 *
 * @param connection A Solana RPC connection
 * @param farmPubkeys The public keys for the GlobalFarm accounts
 * @returns An array of GlobalFarm models
 */
export async function fetchGlobalFarms(
  connection: ConnectionInternal,
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
  connection: ConnectionInternal,
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
