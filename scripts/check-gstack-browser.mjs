import { createRequire } from 'node:module'
import { join } from 'node:path'

// Use the retained, lockfile-installed Playwright, not an application dependency.
const require = createRequire(join(process.env.GSTACK_ROOT, 'runtime.js'))
const { chromium } = require('playwright')
let browser
try {
  browser = await chromium.launch({
    executablePath: process.env.GSTACK_CHROMIUM_PATH,
    args:
      process.env.GSTACK_CHROMIUM_NO_SANDBOX === '1' ? ['--no-sandbox'] : [],
    timeout: 30_000,
  })
  const page = await browser.newPage()
  await page.setContent('<title>gstack readiness</title><h1>Ready</h1>')
  if ((await page.title()) !== 'gstack readiness')
    throw new Error('Wrong render title')
  if ((await page.locator('h1').innerText()) !== 'Ready')
    throw new Error('Wrong rendered content')
  console.log(
    `BROWSER_READY engine=node version=${browser.version()} custom-chromium=true`,
  )
} catch (error) {
  console.error(`BROWSER_UNAVAILABLE ${error.message}`)
  process.exitCode = 1
} finally {
  await browser?.close()
}
