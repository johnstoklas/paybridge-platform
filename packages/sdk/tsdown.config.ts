import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/react/index.ts'],
  deps: {
    neverBundle: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  dts: {
    generator: 'tsgo',
  },
  exports: true,
  // ...config options
})
