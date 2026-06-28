import { ApiStatusPanel } from "./api-status-panel";
import { RouteLensWorkspace } from "./route-lens-workspace";

export function RouteLensScreen() {
  return (
    <main className="page-shell">
      <section className="intro">
        <p className="eyebrow">RouteLens</p>
        <h1>Visual journeys from routes.</h1>
        <p className="intro-copy">
          AI-generated scenes inspired by the geography along your route.
        </p>
      </section>

      <RouteLensWorkspace />
      <ApiStatusPanel />
    </main>
  );
}
