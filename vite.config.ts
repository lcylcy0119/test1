import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const repoName = 'test1'
const spaRoutes = ['schedule', 'quiz', 'exam']

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${repoName}/` : '/',
  plugins: [
    react(),
    {
      name: 'spa-fallback-404',
      closeBundle() {
        const dist = resolve(import.meta.dirname, 'dist')
        const index = resolve(dist, 'index.html')
        copyFileSync(index, resolve(dist, '404.html'))
        for (const route of spaRoutes) {
          const dir = resolve(dist, route)
          mkdirSync(dir, { recursive: true })
          copyFileSync(index, resolve(dir, 'index.html'))
        }
      },
    },
  ],
}))
