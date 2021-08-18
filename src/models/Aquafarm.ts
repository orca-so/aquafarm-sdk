import { u64 } from "@solana/spl-token";
import { PublicKey, Signer, TransactionInstruction } from "@solana/web3.js";
import Decimal from "decimal.js";
import { constructRevertTokensIx } from "..";
import { ZERO } from "../utils/math";
import {
  constructConvertTokensIx,
  constructHarvestIx,
  constructInitUserFarmIx,
} from "../instructions";
import GlobalFarm from "./GlobalFarm";
import UserFarm from "./UserFarm";

export type TransactionBuildingBlocks = {
  instructions: TransactionInstruction[];
  signers: Signer[];
};

export default class Aquafarm {
  globalFarm: GlobalFarm;
  programId: PublicKey;
  userFarm: UserFarm | null;

  constructor(
    globalFarm: GlobalFarm,
    programId: PublicKey,
    userFarm: UserFarm | null
  ) {
    this.globalFarm = globalFarm;
    this.programId = programId;
    this.userFarm = userFarm;
  }

  getEmissionsPer1000USDPerDay(
    totalLiquidityUSD: number,
    rewardTokenDecimals: number
  ): Decimal {
    return new Decimal(this.globalFarm.emissionsPerSecondNumerator.toString())
      .mul(60 * 60 * 24 * 1000)
      .div(this.globalFarm.emissionsPerSecondDenominator.toString())
      .div(totalLiquidityUSD)
      .div(new Decimal(10).pow(rewardTokenDecimals));
  }

  getWeeklyEmissions(rewardTokenDecimals: number): Decimal {
    return new Decimal(this.globalFarm.emissionsPerSecondNumerator.toString())
      .mul(60 * 60 * 24 * 7)
      .div(this.globalFarm.emissionsPerSecondDenominator.toString())
      .div(new Decimal(10).pow(rewardTokenDecimals));
  }

  getHarvestableAmount(): u64 | undefined {
    if (this.userFarm === null) {
      return undefined;
    }

    // h = numUserFarmTokens * (cumulativeEmissionsPerFarmToken - cumulativeEmissionsCheckpoint)
    const cumulativeEmissionsDelta =
      this.globalFarm.cumulativeEmissionsPerFarmToken.sub(
        this.userFarm.cumulativeEmissionsCheckpoint
      );
    return new u64(
      new Decimal(this.userFarm.baseTokensConverted.toString())
        .mul(cumulativeEmissionsDelta)
        .floor()
        .toString()
    );
  }

  getCurrentHarvestableAmount(totalFarmedAmount: u64): u64 | undefined {
    const baseAmount = this.getHarvestableAmount();

    if (
      !baseAmount ||
      this.globalFarm.emissionsPerSecondDenominator.eq(ZERO) ||
      totalFarmedAmount.eq(ZERO)
    ) {
      return baseAmount;
    }

    const elapsedTimeInSeconds = new u64(Date.now() / 1000).sub(
      this.globalFarm.lastUpdatedTimestamp
    );
    return this.globalFarm.emissionsPerSecondNumerator
      .mul(elapsedTimeInSeconds)
      .mul(this.userFarm.baseTokensConverted)
      .div(this.globalFarm.emissionsPerSecondDenominator)
      .div(totalFarmedAmount)
      .add(baseAmount);
  }

  isUserFarmInitialized(): boolean {
    return this.userFarm?.isInitialized || false;
  }

  constructInitUserFarmIx(
    owner: PublicKey,
    userFarmAddress: PublicKey
  ): TransactionInstruction {
    return constructInitUserFarmIx(
      this.globalFarm.publicKey,
      userFarmAddress,
      owner,
      this.programId
    );
  }

  constructConvertTokensIx(
    userTransferAuthority: PublicKey,
    userBaseTokenAccountPubkey: PublicKey,
    userFarmTokenAccountPubkey: PublicKey,
    userRewardTokenAccountPubkey: PublicKey,
    amount: u64,
    userFarmPublicKey?: PublicKey,
    owner?: PublicKey
  ): TransactionInstruction | null {
    const userFarmOwner = this.userFarm?.owner || owner;

    userFarmPublicKey = this.userFarm?.publicKey || userFarmPublicKey;

    if (!userFarmOwner || !userFarmPublicKey) {
      return null;
    }

    return constructConvertTokensIx(
      userFarmOwner,
      userTransferAuthority,
      userBaseTokenAccountPubkey,
      userFarmTokenAccountPubkey,
      userRewardTokenAccountPubkey,
      this.globalFarm.baseTokenVault,
      this.globalFarm.farmTokenMint,
      this.globalFarm.publicKey,
      userFarmPublicKey,
      this.globalFarm.rewardTokenVault,
      this.globalFarm.authority,
      this.programId,
      amount
    );
  }

  constructRevertTokensIx(
    userBurnAuthority: PublicKey,
    userBaseTokenAccountPubkey: PublicKey,
    userFarmTokenAccountPubkey: PublicKey,
    userRewardTokenAccountPubkey: PublicKey,
    amount: u64
  ): TransactionInstruction | null {
    if (!this.userFarm) {
      return null;
    }

    return constructRevertTokensIx(
      this.userFarm.owner,
      userBurnAuthority,
      userBaseTokenAccountPubkey,
      userFarmTokenAccountPubkey,
      userRewardTokenAccountPubkey,
      this.globalFarm.baseTokenVault,
      this.globalFarm.farmTokenMint,
      this.globalFarm.publicKey,
      this.userFarm.publicKey,
      this.globalFarm.rewardTokenVault,
      this.globalFarm.authority,
      this.programId,
      amount
    );
  }

  constructHarvestIx(userRewardTokenAccountPubkey: PublicKey) {
    if (!this.userFarm) {
      return null;
    }

    return constructHarvestIx(
      this.userFarm.owner,
      userRewardTokenAccountPubkey,
      this.globalFarm.baseTokenVault,
      this.globalFarm.publicKey,
      this.userFarm.publicKey,
      this.globalFarm.rewardTokenVault,
      this.globalFarm.authority,
      this.programId
    );
  }
}
