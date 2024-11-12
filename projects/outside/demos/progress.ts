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
