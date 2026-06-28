import type { Coordinate, JourneySummary } from "./route-lens.types";

interface JourneyListProps {
  journeys: JourneySummary[];
}

export function JourneyList({ journeys }: JourneyListProps) {
  return (
    <ul className="m-0 grid list-none gap-2.5 p-0">
      {journeys.map((journey) => (
        <li
          className="grid gap-1.5 border border-[#20231f1f] bg-[#fffdf8] p-3.5"
          key={journey.id}
        >
          <div className="flex items-center justify-between gap-3 font-extrabold max-sm:flex-col max-sm:items-start">
            <span>{formatStyle(journey.style)}</span>
            <span className="inline-flex min-w-[88px] justify-center bg-[#e8eee9] px-2.5 py-1.5 font-mono text-[0.78rem] font-extrabold text-[#315f54] uppercase">
              {journey.status}
            </span>
          </div>
          <div className="text-sm text-[#666c65]">
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
