import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

// React 19 owns metadata after startup. Remove only our static copies so
// navigation never leaves duplicate canonical, Open Graph or schema tags.
document.head.querySelectorAll("[data-prerender]").forEach(tag => tag.remove());
const root = document.getElementById("root")!;
root.removeAttribute("data-static");
createRoot(root).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
