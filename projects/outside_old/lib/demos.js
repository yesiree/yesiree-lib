import { printProgress } from './progress.js'

const demos = {
  demoPrintProgress(opts = {}) {
    const tasks = [
      { label: 'Task 1' },
      { label: 'Task 2' },
      { label: '' },
    ]

    const runners = printProgress(tasks, opts)

    const randomDelay = () => Math.floor(Math.random() * 100) + 10
    const randomProgress = () => Math.random() * 0.10 + 0.01

    runners.forEach((runner, i) => {
      let timeoutId;
      const run = () => {
        const progress = runner.progress ?? 0
        runner.emitter.update(progress)
        if (progress >= 1) {
          clearTimeout(timeoutId)
          return runner.emitter.complete()
        }
        runner.progress = progress + randomProgress()
        timeoutId = setTimeout(run, randomDelay())
      }
      run()
    })

  }
}


const argv = process.argv.slice(2)
const demoName = argv[0]
const demo = demos[`demo${demoName}`]

if (!demo) {
  let message = ''
  if (demoName) {
    message = `Unknown demo: ${demoName}\n`
  }
  message += 'Please specify one of the following:\n\n'
  message += Object
    .keys(demos)
    .map(x => ` - ${x.slice(4)}`)
    .join('\n')
  console.error(`${message}\n`)
  process.exit(1)
} else {
  console.log('Running demo:', demoName)
  demo()
}
