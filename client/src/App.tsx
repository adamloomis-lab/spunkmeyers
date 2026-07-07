import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Experience from "./pages/Experience";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Accessibility from "./pages/Accessibility";
import TV from "./pages/TV";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileActionBar from "./components/MobileActionBar";
import CookieNotice from "./components/CookieNotice";
import FloatingCta from "./components/FloatingCta";
import { useEffect } from "react";
import { useLocation } from "wouter";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/experience" component={Experience} />
      <Route path="/events" component={Events} />
      <Route path="/contact" component={Contact} />
      <Route path="/careers" component={Careers} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/accessibility" component={Accessibility} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  // The /tv board is a full-screen kiosk — no site chrome.
  const isKiosk = location === "/tv";

  if (isKiosk) {
    return (
      <ErrorBoundary>
        <TV />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Navbar />
          <Router />
          <Footer />
          {/* Spacer so footer content isn't hidden under the mobile action bar */}
          <div className="h-16 lg:hidden" aria-hidden="true" />
          <MobileActionBar />
          <FloatingCta />
          <CookieNotice />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
