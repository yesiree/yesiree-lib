import {
  configureLogging,
  logAdd,
  logDebug,
  logDelete,
  logError,
  logInfo,
  logMessage,
  logModify,
  logReady,
  logSimple,
  logWarn,
} from "../lib/logging.ts";

configureLogging({
  quiet: true,
  timestamp: false,
  stdout: Deno.stdout,
});

logMessage(`This message shouldn't show up.`);

configureLogging({
  quiet: false,
  timestamp: true,
  namespace: "ns",
  stdout: Deno.stdout,
});

logMessage(`This message should show up.`);

configureLogging({
  quiet: false,
  timestamp: true,
  namespace: "",
  stdout: Deno.stdout,
});

logMessage("this is a message");
logSimple("this is a simple message");

logDebug("this is a debug message");
logInfo("this is an info message");
logWarn("this is a warning message");
logError("this is an error message");

logAdd("this is an add message");
logModify("this is a modify message");
logDelete("this is a delete message");
logReady("this is a ready message");

logMessage(`quiet via options.`, { quiet: true });
logMessage(`namespace via options.`, { namespace: "opts" });
logMessage(`timestamp.`, { timestamp: false });
