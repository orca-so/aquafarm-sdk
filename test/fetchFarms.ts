import { Connection } from "@solana/web3.js";
import { fetchGlobalFarms, fetchUserFarms } from "../src/rpc/farms";
import { TestAccounts } from "./setUpAccounts";
import { ConnectionInternal } from "../src/utils/types";
import { AQUAFARM_PROGRAM_ID } from "./utils/constants";

export default async function fetchFarms(
  connection: Connection,
  testAccounts: TestAccounts
) {
  const { globalFarm: globalFarmKey, userFarmOwner } = testAccounts;
  const globalFarm = await fetchGlobalFarms(
    connection as ConnectionInternal,
    [globalFarmKey],
    AQUAFARM_PROGRAM_ID
  );

  console.log(`${globalFarm}`);

  const userFarm = await fetchUserFarms(
    connection as ConnectionInternal,
    userFarmOwner.publicKey,
    [globalFarmKey],
    AQUAFARM_PROGRAM_ID
  );

  console.log(`${userFarm}`);

  return [globalFarm[0], userFarm[0]];
}
