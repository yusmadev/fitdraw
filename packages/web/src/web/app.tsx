import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

// The landing carries the motion stack (GSAP, Lenis, the Rive runtime) and the studio carries
// the drawing/export code — neither visitor needs both, so each page is its own chunk.
const Landing = lazy(() => import("./pages/landing"));
const Studio = lazy(() => import("./pages/studio"));

function RouteFallback() {
  return <div className="min-h-screen t-bg" />;
}

function App() {
  return (
    <Provider>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/studio">{() => <Studio />}</Route>
          <Route path="/personnalisation">{() => <Studio initialSheet="branding" />}</Route>
          <Route path="/compte">{() => <Studio initialSheet="account" />}</Route>
          <Route>{() => <Landing />}</Route>
        </Switch>
      </Suspense>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
