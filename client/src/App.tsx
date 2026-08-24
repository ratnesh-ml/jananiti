import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import CitizenProfile from "@/pages/CitizenProfile";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Operations from "./pages/Operations";
import Assignments from "./pages/Assignments";
import Priorities from "./pages/Priorities";
import PublicActivity from "./pages/PublicActivity";
import Heatmap from "./pages/Heatmap";
import VerifyNearby from "./pages/VerifyNearby";
import SubmitIssue from "./pages/SubmitIssue";
import TrackIssue from "./pages/TrackIssue";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/report"} component={SubmitIssue} />
      <Route path={"/track"} component={TrackIssue} />
      <Route path={"/activity"} component={PublicActivity} />
      <Route path={"/heatmap"} component={Heatmap} />
      <Route path={"/verify"} component={VerifyNearby} />
      <Route path={"/me"} component={CitizenProfile} />
      <Route path={"/operations"} component={Operations} />
      <Route path={"/assignments"} component={Assignments} />
      <Route path={"/priorities"} component={Priorities} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
