import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CivicMobileNav } from "@/components/CivicHeader";
import { useAuth } from "@/_core/hooks/useAuth";
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
import Explore from "./pages/Explore";
import ActionCenter from "./pages/ActionCenter";
import SignIn from "./pages/SignIn";
import Discussion from "./pages/Discussion";
import Onboarding from "./pages/Onboarding";
import JudgeDemo from "./pages/JudgeDemo";
import FirebaseWorkspace from "./pages/FirebaseWorkspace";
import { useLocation } from "wouter";
import { shouldRenderFirebaseWorkspace, shouldRenderStaticJudgeDemo } from "./lib/judgeDemoFallback";

function LegacyRouter() {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  const hostname = typeof window === "undefined" ? "" : window.location.hostname;
  if (shouldRenderStaticJudgeDemo(hostname, location)) return <JudgeDemo variant="judge" />;
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f6f8fb] px-6 text-center"><div><div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-[#0e5bb7]" /><p className="mt-4 text-sm font-bold text-[#54708d]">Preparing your civic space…</p></div></div>;
  if (!user) return location === "/judge-demo" ? <JudgeDemo variant="judge" /> : location === "/signin" ? <SignIn /> : <Onboarding />;
  return (<>
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/report"} component={SubmitIssue} />
      <Route path={"/track"} component={TrackIssue} />
      <Route path={"/activity"} component={PublicActivity} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/notifications"} component={ActionCenter} />
      <Route path={"/signin"} component={SignIn} />
      <Route path={"/discussion"} component={Discussion} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/judge-demo"} component={() => <JudgeDemo variant="judge" />} />
      <Route path={"/heatmap"} component={Heatmap} />
      <Route path={"/verify"} component={VerifyNearby} />
      <Route path={"/me"} component={CitizenProfile} />
      <Route path={"/profile"} component={CitizenProfile} />
      <Route path={"/operations"} component={Operations} />
      <Route path={"/assignments"} component={Assignments} />
      <Route path={"/priorities"} component={Priorities} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    {user && <CivicMobileNav />}
  </>);
}

function Router() {
  const hostname = typeof window === "undefined" ? "" : window.location.hostname;
  const pathname = typeof window === "undefined" ? "" : window.location.pathname;
  const isManagedPreviewRoot = import.meta.env.DEV && pathname === "/";
  if (shouldRenderFirebaseWorkspace(hostname) || isManagedPreviewRoot || (import.meta.env.DEV && pathname === "/firebase-workspace")) return <FirebaseWorkspace />;
  return <LegacyRouter />;
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
          <div className="pb-20 sm:pb-0"><Router /></div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
