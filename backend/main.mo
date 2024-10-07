import Bool "mo:base/Bool";
import Func "mo:base/Func";
import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";

actor LogAggregator {
    // Define log entry type
    type LogEntry = {
        canisterId: Text;
        timestamp: Int;
        message: Text;
    };

    // Stable variable to store logs
    private stable var stableLogs: [(Text, LogEntry)] = [];

    // HashMap to store logs in memory
    private var logs = HashMap.HashMap<Text, LogEntry>(0, Text.equal, Text.hash);

    // Authorized canisters
    private stable var authorizedCanisters: [Principal] = [];

    // System functions for upgrades
    system func preupgrade() {
        stableLogs := Iter.toArray(logs.entries());
    };

    system func postupgrade() {
        logs := HashMap.fromIter<Text, LogEntry>(stableLogs.vals(), 0, Text.equal, Text.hash);
        stableLogs := [];
    };

    // Function to add a new log entry
    public shared({ caller }) func addLog(message: Text) : async Result.Result<(), Text> {
        if (not isAuthorized(caller)) {
            return #err("Unauthorized canister");
        };

        let logId = Text.concat(Principal.toText(caller), Int.toText(Time.now()));
        let newLog: LogEntry = {
            canisterId = Principal.toText(caller);
            timestamp = Time.now();
            message = message;
        };

        logs.put(logId, newLog);
        #ok(())
    };

    // Function to retrieve logs with pagination
    public query func getLogs(start: Nat, limit: Nat) : async [LogEntry] {
        let logEntries = Iter.toArray(logs.vals());
        let totalLogs = logEntries.size();

        if (start >= totalLogs) {
            return [];
        };

        let end = Nat.min(start + limit, totalLogs);
        Array.tabulate(end - start, func (i: Nat) : LogEntry {
            logEntries[start + i]
        })
    };

    // Function to search logs
    public query func searchLogs(searchTerm: Text) : async [LogEntry] {
        let searchResults = Buffer.Buffer<LogEntry>(0);
        for (log in logs.vals()) {
            if (Text.contains(log.message, #text searchTerm)) {
                searchResults.add(log);
            };
        };
        Buffer.toArray(searchResults)
    };

    // New function to get logs by canister ID
    public query func getLogsByCanisterId(canisterId: Text) : async [LogEntry] {
        let filteredLogs = Buffer.Buffer<LogEntry>(0);
        for (log in logs.vals()) {
            if (log.canisterId == canisterId) {
                filteredLogs.add(log);
            };
        };
        Buffer.toArray(filteredLogs)
    };

    // Function to authorize a new canister
    public shared({ caller }) func authorizeCanister(canisterId: Principal) : async () {
        assert(caller == Principal.fromActor(LogAggregator));
        authorizedCanisters := Array.append(authorizedCanisters, [canisterId]);
    };

    // Helper function to check if a canister is authorized
    private func isAuthorized(canisterId: Principal) : Bool {
        Option.isSome(Array.find(authorizedCanisters, func (id: Principal) : Bool { id == canisterId }))
    };
}
