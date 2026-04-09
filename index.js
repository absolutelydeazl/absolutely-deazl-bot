import 'dotenv/config'
import 'rootpath'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import CFonts from 'cfonts'
import { fileURLToPath } from 'url'
import { Utils } from '@neoxr/wb'
import express from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEMP_DIR = path.resolve('./temp')
const PAIRING_FILE = path.resolve('./pairing_code.txt')

const ensureTempDir = async () => {
   try {
      await fs.mkdir(TEMP_DIR, { recursive: true })
   } catch (e) {
      Utils.printError('Failed to ensure temp directory: ' + e)
   }
}

const cleanTemp = async () => {
   try {
      const files = await fs.readdir(TEMP_DIR)

      await Promise.all(
         files.map(async file => {
            if (file.endsWith('.file')) return

            const filePath = path.join(TEMP_DIR, file)
            try {
               const stats = await fs.stat(filePath)
               if (stats.isFile()) await fs.unlink(filePath)
            } catch {
               Utils.printWarning(`Skip failed file: ${file}`)
            }
         })
      )
   } catch (e) {
      Utils.printError('Error reading temp directory: ' + e)
   }
}

const startAutoClean = async () => {
   await ensureTempDir()
   cleanTemp()
   setInterval(cleanTemp, 60 * 60 * 1000)
}

let p = null
function start() {
   const args = [path.join(__dirname, 'client.js'), ...process.argv.slice(2)]
   p = spawn(process.argv[0], args, {
      stdio: ['inherit', 'pipe', 'pipe', 'ipc']
   })

   const pairingPattern = /([A-Z0-9]{4}-[A-Z0-9]{4})/

   const handleOutput = async (data) => {
      const text = data.toString()
      process.stdout.write(text)

      try {
         await fs.appendFile('./bot_output.log', text, 'utf-8')
      } catch {}

      const match = text.match(pairingPattern)
      if (match) {
         const code = match[1]
         console.log(`\n>>> PAIRING CODE: ${code} <<<\n`)
         try {
            await fs.writeFile(PAIRING_FILE, code, 'utf-8')
         } catch {}
      }
   }

   p.stdout.on('data', handleOutput)
   p.stderr.on('data', handleOutput)

   p.on('message', data => {
      if (data === 'reset') {
         console.log('Restarting...')
         p.kill()
         p = null
      }
   })
   .on('exit', code => {
      console.error('Exited with code:', code)
      setTimeout(start, 5000)
   })
}

console.clear()
const major = parseInt(process.versions.node.split('.')[0], 10)
if (major < 20) {
   console.error(
      `\n❌ This script requires Node.js 20+ to run reliably.\n` +
      `   You are using Node.js ${process.versions.node}.\n` +
      `   Please upgrade to Node.js 20+ to proceed.\n`
   )
   process.exit(1)
}

CFonts.say('NEOXR BOT', {
   font: 'tiny',
   align: 'center',
   colors: ['system']
})
CFonts.say('Github : https://github.com/neoxr/neoxr-bot', {
   colors: ['system'],
   font: 'console',
   align: 'center'
})

start()
startAutoClean()

const app = express()
app.get('/', (req, res) => {
   res.send('Absolutely Deazl Bot is running.')
})
app.get('/pairing', async (req, res) => {
   try {
      const code = await fs.readFile(PAIRING_FILE, 'utf-8')
      res.send(`Pairing Code: ${code.trim()}`)
   } catch {
      res.send('Pairing code not yet generated. Please wait a moment and refresh.')
   }
})
app.listen(8080, () => console.log('Keep-alive server (Express) listening on port 8080'))
