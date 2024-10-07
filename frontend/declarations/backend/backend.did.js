export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const LogEntry = IDL.Record({
    'message' : IDL.Text,
    'timestamp' : IDL.Int,
    'canisterId' : IDL.Text,
  });
  return IDL.Service({
    'addLog' : IDL.Func([IDL.Text], [Result], []),
    'authorizeCanister' : IDL.Func([IDL.Principal], [], []),
    'getLogs' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(LogEntry)], ['query']),
    'searchLogs' : IDL.Func([IDL.Text], [IDL.Vec(LogEntry)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
