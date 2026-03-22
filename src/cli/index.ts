import { defineCommand, runMain } from 'citty'
import { checkCommand } from './commands/check'

const main = defineCommand({
  meta: { name: 'envguard', version: '0.1.0', description: 'Type-safe .env manager' },
  subCommands: {
    check: checkCommand,
  },
})

runMain(main)
