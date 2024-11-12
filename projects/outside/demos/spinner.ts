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
