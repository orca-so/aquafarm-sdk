/**
 * Because it contains imports and exports, this file is treated as a module.
 * This means these types ARE NOT global — they must be imported in order to be used.
 */

import { Connection } from "@solana/web3.js";

export type RpcParams = {
  methodName: string;
  args: Array<any>;
};

export type RpcBatchRequest = (requests: RpcParams[]) => any;

export interface ConnectionInternal extends Connection {
  _rpcBatchRequest: RpcBatchRequest;
}
