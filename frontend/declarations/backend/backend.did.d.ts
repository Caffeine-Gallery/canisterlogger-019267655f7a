import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface LogEntry {
  'message' : string,
  'timestamp' : bigint,
  'canisterId' : string,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export interface _SERVICE {
  'addLog' : ActorMethod<[string], Result>,
  'authorizeCanister' : ActorMethod<[Principal], undefined>,
  'getLogs' : ActorMethod<[bigint, bigint], Array<LogEntry>>,
  'getLogsByCanisterId' : ActorMethod<[string], Array<LogEntry>>,
  'searchLogs' : ActorMethod<[string], Array<LogEntry>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
