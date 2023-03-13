import { defineConfig, Options } from 'tsup'

const commonConfigs: Options = {
  format: ['esm', 'cjs'],
  minify: true,
  treeshake: true,
  dts: true,
  clean: true,
  sourcemap: true
}

export default defineConfig({
  tsconfig: 'tsconfig.lib.json',
  entry: ['./core/index.ts'],
  ...commonConfigs
})
