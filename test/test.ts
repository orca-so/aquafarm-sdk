import { Connection } from "@solana/web3.js";
import addRewards from "./addRewards";
import convertTokens from "./convertTokens";
import fetchFarms from "./fetchFarms";
import harvest from "./harvest";
import initGlobalFarm from "./initGlobalFarm";
import initUserFarm from "./initUserFarm";
import removeRewards from "./removeRewards";
import revertTokens from "./revertTokens";
import setEmissionsPerSecond from "./setEmissionsPerSecond";
import setUpAccounts from "./setUpAccounts";
import { SOLANA_URL } from "./utils/constants";

async function run() {
  const connection = new Connection(SOLANA_URL, "singleGossip");

  const testAccounts = await setUpAccounts(connection);

  await initGlobalFarm(connection, testAccounts);
  await fetchFarms(connection, testAccounts);

  await initUserFarm(connection, testAccounts);
  await fetchFarms(connection, testAccounts);

  await setEmissionsPerSecond(connection, testAccounts);
  await fetchFarms(connection, testAccounts);

  await addRewards(connection, testAccounts);
  await removeRewards(connection, testAccounts);
  await convertTokens(connection, testAccounts);
  await revertTokens(connection, testAccounts);
  await harvest(connection, testAccounts);
  await fetchFarms(connection, testAccounts);
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  })
  .then(() => process.exit());
