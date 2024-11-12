# outside

A tiny tool for CLI output.

## Examples

Following are a few examples of how to use `outside`.

### Logging

```javascript
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
});

logMessage(`This message shouldn't show up.`);

configureLogging({
  quiet: false,
  timestamp: true,
  namespace: "ns",
});

logMessage(`This message should show up.`);

configureLogging({
  quiet: false,
  timestamp: true,
  namespace: "",
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
```

### Progress

```javascript
import { printProgress } from "../lib/progress.ts";

const randomDelay = () => Math.floor(Math.random() * 100) + 100;
const randomProgress = () => Math.random() * 0.10 + 0.01;

const tasks = [
  { label: "Task 1", value: 0 },
  { label: "Task 2", value: 0 },
  { label: "Task 3", value: 0 },
];

const runners = printProgress(tasks);

runners.forEach((runner) => {
  let timeoutId: number;
  const run = () => {
    const value = runner.task.value ?? 0;
    runner.updateProgress(value);
    if (value >= 1) {
      clearTimeout(timeoutId);
      return runner.updateProgress(1);
    }
    runner.task.value = value + randomProgress();
    timeoutId = setTimeout(run, randomDelay());
  };
  run();
});
```

### Spinner

```javascript
import { printSpinners } from "../lib/spinner.ts";

const count = 1;

const randomDelay = () => Math.floor(Math.random() * 5000) + 500;
const flipCoin = (): boolean => Math.random() > 0.5;
const randomPromsie = () =>
  new Promise((res, rej) => {
    const fn = flipCoin() ? res : rej;
    setTimeout(fn, randomDelay());
  });

const tasks = Array(count)
  .fill(0)
  .map((_, index) => ({
    label: `Task ${index}`,
    promise: randomPromsie(),
  }));

printSpinners(tasks);
```
