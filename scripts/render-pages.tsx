import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import App from "../client/src/App";
import { ChristmasSeasonContext } from "../client/src/lib/holiday";
export { PAGE_METADATA } from "../client/src/lib/page-metadata";

export function renderPage(path: string, christmas = false) {
  return renderToString(
    <HelmetProvider>
      <Router ssrPath={path}>
        <ChristmasSeasonContext.Provider value={christmas}>
          <App />
        </ChristmasSeasonContext.Provider>
      </Router>
    </HelmetProvider>
  );
}
