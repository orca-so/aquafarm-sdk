import { TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  generateBufferData,
  INIT_GLOBAL_FARM_DATA_LAYOUT,
  INIT_USER_FARM_DATA_LAYOUT,
  u64ToBuffer,
  uint64,
} from "./utils/layout";
import BufferLayout from "buffer-layout";

export enum INSTRUCTIONS {
  InitGlobalFarm,
  InitUserFarm,
  ConvertTokens,
  RevertTokens,
  Harvest,
  RemoveRewards,
  SetEmissionsPerSecond,
}

export function constructInitGlobalFarmIx(
  globalFarmStatePubkey: PublicKey,
  baseTokenMintPubkey: PublicKey,
  globalBaseTokenVaultPubkey: PublicKey,
  rewardTokenVaultPubkey: PublicKey,
  farmTokenMintPubkey: PublicKey,
  emissionsAuthorityPubkey: PublicKey,
  removeRewardsAuthorityPubkey: PublicKey,
  emissionsPerSecondNumerator: u64,
  emissionsPerSecondDenominator: u64,
  nonce: number,
  aquafarmProgramId: PublicKey,
  funderPubkey: PublicKey
): TransactionInstruction {
  const keys = [
    { pubkey: baseTokenMintPubkey, isSigner: false, isWritable: false },
    {
      pubkey: globalBaseTokenVaultPubkey,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: rewardTokenVaultPubkey, isSigner: false, isWritable: false },
    { pubkey: farmTokenMintPubkey, isSigner: false, isWritable: false },
    { pubkey: globalFarmStatePubkey, isSigner: false, isWritable: true },
    { pubkey: funderPubkey, isSigner: true, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: aquafarmProgramId,
    data: generateBufferData(INIT_GLOBAL_FARM_DATA_LAYOUT, {
      instruction: INSTRUCTIONS.InitGlobalFarm,
      nonce,
      tokenProgramId: TOKEN_PROGRAM_ID.toBuffer(),
      emissionsAuthority: emissionsAuthorityPubkey.toBuffer(),
      removeRewardsAuthority: removeRewardsAuthorityPubkey.toBuffer(),
      emissionsPerSecondNumerator: emissionsPerSecondNumerator.toBuffer(),
      emissionsPerSecondDenominator: emissionsPerSecondDenominator.toBuffer(),
    }),
  });
}

export function constructInitUserFarmIx(
  globalFarmStatePubkey: PublicKey,
  userFarmStatePubkey: PublicKey,
  ownerPubkey: PublicKey,
  aquafarmProgramId: PublicKey
): TransactionInstruction {
  const keys = [
    {
      pubkey: globalFarmStatePubkey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: userFarmStatePubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: ownerPubkey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: aquafarmProgramId,
    data: generateBufferData(INIT_USER_FARM_DATA_LAYOUT, {
      instruction: INSTRUCTIONS.InitUserFarm,
    }), // Initialize user farm instruction
  });
}

export function constructConvertTokensIx(
  userFarmOwner: PublicKey,
  userTransferAuthority: PublicKey,
  userBaseTokenAccountPubkey: PublicKey,
  userFarmTokenAccountPubkey: PublicKey,
  userRewardTokenAccountPubkey: PublicKey,
  globalBaseTokenVaultPubkey: PublicKey,
  farmTokenMintPubkey: PublicKey,
  globalFarm: PublicKey,
  userFarm: PublicKey,
  globalRewardTokenVaultPubkey: PublicKey,
  authority: PublicKey,
  aquafarmProgramId: PublicKey,
  amountToConvert: u64
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: userFarmOwner,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: userBaseTokenAccountPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: globalBaseTokenVaultPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userTransferAuthority,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: farmTokenMintPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userFarmTokenAccountPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: globalFarm,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userFarm,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: globalRewardTokenVaultPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userRewardTokenAccountPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: authority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: aquafarmProgramId,
    data: generateBufferData(
      BufferLayout.struct([
        BufferLayout.u8("instruction"),
        uint64("amountToConvert"),
      ]),
      {
        instruction: INSTRUCTIONS.ConvertTokens,
        amountToConvert: amountToConvert.toBuffer(), // The time period over which to distribute: 2 weeks
      }
    ),
  });
}

export function constructRevertTokensIx(
  userFarmOwner: PublicKey,
  userBurnAuthority: PublicKey,
  userBaseTokenAccountPubkey: PublicKey,
  userFarmTokenAccountPubkey: PublicKey,
  userRewardTokenAccountPubkey: PublicKey,
  globalBaseTokenVaultPubkey: PublicKey,
  farmTokenMintPubkey: PublicKey,
  globalFarm: PublicKey,
  userFarm: PublicKey,
  globalRewardTokenVaultPubkey: PublicKey,
  authority: PublicKey,
  aquafarmProgramId: PublicKey,
  amountToRevert: u64
) {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: userFarmOwner,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: userBaseTokenAccountPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: globalBaseTokenVaultPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: farmTokenMintPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userFarmTokenAccountPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userBurnAuthority,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: globalFarm,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userFarm,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: globalRewardTokenVaultPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userRewardTokenAccountPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: authority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: aquafarmProgramId,
    data: generateBufferData(
      BufferLayout.struct([
        BufferLayout.u8("instruction"),
        uint64("amountToRevert"),
      ]),
      {
        instruction: INSTRUCTIONS.RevertTokens,
        amountToRevert: amountToRevert.toBuffer(),
      }
    ),
  });
}

export function constructHarvestIx(
  userFarmOwner: PublicKey,
  userRewardTokenAccountPubkey: PublicKey,
  globalBaseTokenVaultPubkey: PublicKey,
  globalFarm: PublicKey,
  userFarm: PublicKey,
  globalRewardTokenVaultPubkey: PublicKey,
  authority: PublicKey,
  aquafarmProgramId: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: userFarmOwner,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: globalFarm,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userFarm,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: globalBaseTokenVaultPubkey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: globalRewardTokenVaultPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userRewardTokenAccountPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: authority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: aquafarmProgramId,
    data: generateBufferData(
      BufferLayout.struct([BufferLayout.u8("instruction")]),
      {
        instruction: INSTRUCTIONS.Harvest,
      }
    ),
  });
}

export function constructSetEmissionsPerSecondIx(
  emissionsAuthorityPubkey: PublicKey,
  globalFarmStatePubkey: PublicKey,
  globalBaseTokenVaultKey: PublicKey,
  aquafarmProgramId: PublicKey,
  numerator: u64,
  denominator: u64
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: emissionsAuthorityPubkey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: globalFarmStatePubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: globalBaseTokenVaultKey,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: aquafarmProgramId,
    data: generateBufferData(
      BufferLayout.struct([
        BufferLayout.u8("instruction"),
        uint64("emissionsPerSecondNumerator"),
        uint64("emissionsPerSecondDenominator"),
      ]),
      {
        instruction: INSTRUCTIONS.SetEmissionsPerSecond,
        emissionsPerSecondNumerator: u64ToBuffer(numerator),
        emissionsPerSecondDenominator: u64ToBuffer(denominator),
      }
    ),
  });
}

export function constructRemoveRewardsIx(
  globalFarmStatePubkey: PublicKey,
  removeRewardsAuthorityPubkey: PublicKey,
  destRewardTokenAccountPubkey: PublicKey,
  globalRewardTokenVaultPubkey: PublicKey,
  authority: PublicKey,
  aquafarmProgramId: PublicKey,
  amountToConvert: u64
) {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: globalFarmStatePubkey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: removeRewardsAuthorityPubkey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: destRewardTokenAccountPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: globalRewardTokenVaultPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: authority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: aquafarmProgramId,
    data: generateBufferData(
      BufferLayout.struct([
        BufferLayout.u8("instruction"),
        uint64("amountToRemove"),
      ]),
      {
        instruction: INSTRUCTIONS.RemoveRewards,
        amountToRemove: amountToConvert.toBuffer(), // The time period over which to distribute: 2 weeks
      }
    ),
  });
}
