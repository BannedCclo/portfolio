import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// global design system — loaded once, ahead of every section's own CSS
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/reduced-motion.css";

/* The hero derives its entire entrance (blur, small scale, distant camera)
   from scroll position 0. Without this the browser's scroll restoration can
   drop you mid-sequence on reload, and it looks like the entrance is simply
   missing. Runs before React renders anything, same as the static version. */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
