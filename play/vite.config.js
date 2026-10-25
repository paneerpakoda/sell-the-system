import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Project Pages serves the built app at /sell-the-system/. Local dev stays at /.
const base = process.env.GITHUB_ACTIONS ? "/sell-the-system/" : "/"

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5173, strictPort: true }
})
