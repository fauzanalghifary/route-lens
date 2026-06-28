import type { Coordinate, JourneySummary } from "./route-lens.types";

interface JourneyListProps {
  journeys: JourneySummary[];
}

export function JourneyList({ journeys }: JourneyListProps) {
  return (
    <ul className="journey-list">
      {journeys.map((journey) => (
        <li className="journey-item" key={journey.id}>
          <div className="journey-title">
            <span>{formatStyle(journey.style)}</span>
            <span className="status-pill">{journey.status}</span>
          </div>
          <div className="journey-meta">
            {journey.completedImages}/{journey.totalImages} images ·{" "}
            {formatCoordinate(journey.origin)} to{" "}
            {formatCoordinate(journey.destination)}
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatCoordinate(coordinate: Coordinate): string {
  return `${coordinate.lat.toFixed(4)}, ${coordinate.lng.toFixed(4)}`;
}

function formatStyle(style: string): string {
  return style
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
