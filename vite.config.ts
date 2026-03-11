import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


function reactDomServerBrowserPlugin() {
  const serverBrowserPath = path.resolve(__dirname, 'node_modules/react-dom/server.browser.js')
  const nodeProductionPath = path.resolve(
    __dirname,
    'node_modules/react-dom/cjs/react-dom-server.node.production.js'
  )
  const browserProductionPath = path.resolve(
    __dirname,
    'node_modules/react-dom/cjs/react-dom-server.browser.production.js'
  )
  return {
    name: 'react-dom-server-browser',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (id === 'react-dom/server' || id.startsWith('react-dom/server')) {
        return serverBrowserPath
      }
      // Redirect node production/development to browser version
      if (id.includes('react-dom-server.node')) {
        return browserProductionPath
      }
      if (id === nodeProductionPath || id.endsWith('react-dom-server.node.production.js')) {
        return browserProductionPath
      }
      return null
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-dom/server': path.resolve(__dirname, 'node_modules/react-dom/server.browser.js'),
      util: path.resolve(__dirname, 'src/lib/util-shim.ts'),
    },
  },
  build: {
    outDir: 'build',  
  },
  plugins: [
    reactDomServerBrowserPlugin(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tsconfigPaths(),  
  ],
})