import { AccountInfo, PublicKey } from "@solana/web3.js";
import { u64 } from "@solana/spl-token";
import BufferLayout from "buffer-layout";
import BN from "bn.js";
import Decimal from "decimal.js";

/**
 * Layout for a public key
 */
export const publicKey = (property = "publicKey"): Object => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property = "uint64"): Object => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a 256bit unsigned value
 */
export const uint256 = (property = "uint256"): Object => {
  return BufferLayout.blob(32, property);
};

// Converts from a Uint8 buffer to a Public Key
export function uint8ToPubkey(data: Uint8Array) {
  return new PublicKey(data);
}

// Converts from a little-endian Uint8-encoded u64 to a JS number
export function uint8ToNumber(data: Uint8Array) {
  return new BN(data, 10, "le").toNumber();
}

// Converts from a little-endian Uint8-encoded u64 to a JS number
export function uint8ToU64(data: Uint8Array) {
  return new u64(data, 10, "le");
}

// Converts from a little-endian Uint8-encoded u64 to a JS str
export function uint256ToString(data: Uint8Array) {
  return new BN(data, 10, "le").toString();
}

// Converts from a little-endian Uint8-encoded u64 to a Decimal
export function uint256ToDecimal(data: Uint8Array) {
  return new Decimal(new BN(data, 10, "le").toString()).dividedBy(
    "1_000_000_000_000"
  );
}

export function u64ToBuffer(num: u64): Buffer {
  return (num as BN).toBuffer("le", 8);
}

export function generateBufferData(
  dataLayout: typeof BufferLayout,
  instructionData: any
) {
  // Outline the structure of data expected
  let data = Buffer.alloc(dataLayout.span);
  {
    const encodeLength = dataLayout.encode(instructionData, data);
    data = data.slice(0, encodeLength);
  }

  return data;
}

export function decodeGlobalFarmBuffer(accountInfo: AccountInfo<Buffer>) {
  const decoded = GLOBAL_FARM_DATA_LAYOUT.decode(
    accountInfo.data
  ) as GlobalFarmStateLayout;

  return {
    isInitialized: !!decoded.isInitialized,
    accountType: decoded.accountType,
    nonce: decoded.nonce,
    tokenProgramId: uint8ToPubkey(decoded.tokenProgramId),
    emissionsAuthority: uint8ToPubkey(decoded.emissionsAuthority),
    removeRewardsAuthority: uint8ToPubkey(decoded.removeRewardsAuthority),
    baseTokenMint: uint8ToPubkey(decoded.baseTokenMint),
    baseTokenVault: uint8ToPubkey(decoded.baseTokenVault),
    rewardTokenVault: uint8ToPubkey(decoded.rewardTokenVault),
    farmTokenMint: uint8ToPubkey(decoded.farmTokenMint),
    emissionsPerSecondNumerator: uint8ToU64(
      decoded.emissionsPerSecondNumerator
    ),
    emissionsPerSecondDenominator: uint8ToU64(
      decoded.emissionsPerSecondDenominator
    ),
    lastUpdatedTimestamp: uint8ToU64(decoded.lastUpdatedTimestamp),
    cumulativeEmissionsPerFarmToken: uint256ToDecimal(
      decoded.cumulativeEmissionsPerFarmToken
    ),
  };
}

export const GLOBAL_FARM_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  BufferLayout.u8("accountType"),
  BufferLayout.u8("nonce"),
  publicKey("tokenProgramId"),
  publicKey("emissionsAuthority"),
  publicKey("removeRewardsAuthority"),
  publicKey("baseTokenMint"),
  publicKey("baseTokenVault"),
  publicKey("rewardTokenVault"),
  publicKey("farmTokenMint"),
  uint64("emissionsPerSecondNumerator"),
  uint64("emissionsPerSecondDenominator"),
  uint64("lastUpdatedTimestamp"),
  uint256("cumulativeEmissionsPerFarmToken"),
]);

export interface GlobalFarmStateLayout {
  isInitialized: number;
  accountType: number;
  nonce: number;
  tokenProgramId: Uint8Array;
  emissionsAuthority: Uint8Array;
  removeRewardsAuthority: Uint8Array;
  baseTokenMint: Uint8Array;
  baseTokenVault: Uint8Array;
  rewardTokenVault: Uint8Array;
  farmTokenMint: Uint8Array;
  emissionsPerSecondNumerator: Uint8Array;
  emissionsPerSecondDenominator: Uint8Array;
  lastUpdatedTimestamp: Uint8Array;
  cumulativeEmissionsPerFarmToken: Uint8Array;
}

export const INIT_GLOBAL_FARM_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("instruction"),
  BufferLayout.u8("nonce"),
  publicKey("tokenProgramId"),
  publicKey("emissionsAuthority"),
  publicKey("removeRewardsAuthority"),
  uint64("emissionsPerSecondNumerator"),
  uint64("emissionsPerSecondDenominator"),
]);

export function decodeUserFarmBuffer(accountInfo: AccountInfo<Buffer>) {
  const decoded = USER_FARM_DATA_LAYOUT.decode(
    accountInfo.data
  ) as UserFarmStateLayout;

  return {
    isInitialized: !!decoded.isInitialized,
    accountType: decoded.accountType,
    globalFarm: uint8ToPubkey(decoded.globalFarm),
    owner: uint8ToPubkey(decoded.owner),
    baseTokensConverted: uint8ToU64(decoded.baseTokensConverted),
    cumulativeEmissionsCheckpoint: uint256ToDecimal(
      decoded.cumulativeEmissionsCheckpoint
    ),
  };
}

export const USER_FARM_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  BufferLayout.u8("accountType"),
  publicKey("globalFarm"),
  publicKey("owner"),
  uint64("baseTokensConverted"),
  uint256("cumulativeEmissionsCheckpoint"),
]);

export interface UserFarmStateLayout {
  isInitialized: number;
  accountType: number;
  globalFarm: Uint8Array;
  owner: Uint8Array;
  baseTokensConverted: Uint8Array;
  cumulativeEmissionsCheckpoint: Uint8Array;
}

export const INIT_USER_FARM_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("instruction"),
]);
