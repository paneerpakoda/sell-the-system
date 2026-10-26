import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.jsx"
import "./styles/unlumen.css"
import "./styles/index.css"
import "./styles.css"
import "./styles/sk-apply.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
