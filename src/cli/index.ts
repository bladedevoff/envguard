import { defineCommand, runMain } from 'citty'
import { checkCommand } from './commands/check'
import { initCommand } from './commands/init'

const main = defineCommand({
  meta: { name: 'envguard', version: '0.1.0', description: 'Type-safe .env manager' },
  subCommands: {
    check: checkCommand,
    init: initCommand,
  },
})

runMain(main)
