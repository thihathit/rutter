import { resolve } from 'node:path'
import { argv } from 'node:process'
import { writeFile, readFile, copyFile } from 'node:fs/promises'

import { z } from 'zod'
import { trimStart } from 'lodash-es'

const sourceReadme = resolve('README.md')
const finalReadme = resolve('dist', 'README.md')
const sourcePkg = resolve('package.json')
const finalPkg = resolve('dist', 'package.json')

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

  await Promise.all([
    copyFile(sourcePkg, finalPkg),
    copyFile(sourceReadme, finalReadme)
  ])

  const pkg = JSON.parse(
    await readFile(finalPkg, {
      encoding: 'utf-8'
    })
  )

  // Sync version
  pkg.version = trimStart(version, 'v')

  // Remove scripts
  delete pkg.scripts

  await writeFile(finalPkg, JSON.stringify(pkg, null, 2))
}
