import { resolve } from 'node:path'
import { argv } from 'node:process'
import { writeFile, readFile } from 'node:fs/promises'

import { z } from 'zod'
import { trimStart } from 'lodash-es'

const sourcePkg = resolve('package.json')

const node_args = argv.slice(2)
const node_options = node_args.reduce((opt, arg) => {
  const [name, value] = arg.split('=')

  return {
    ...opt,
    [name]: value
  }
}, {})

const options = z
  .object({
    version: z.string()
  })
  .safeParse(node_options)

if (options.success == false) {
  console.error(options.error.message)
} else {
  const { version } = options.data

  const pkg = JSON.parse(
    await readFile(sourcePkg, {
      encoding: 'utf-8'
    })
  )

  // Sync version
  pkg.version = trimStart(version, 'v')

  // Cleanup
  delete pkg.scripts
  delete pkg.engines
  delete pkg.packageManager

  await writeFile(sourcePkg, JSON.stringify(pkg, null, 2))
}
