"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listJourneys, routeLensQueryKeys } from "@/lib/route-lens/api";
import type { JourneySummary } from "@/lib/route-lens/types";

export default function JourneysPage() {
  const journeysQuery = useQuery({
    queryKey: routeLensQueryKeys.journeys(),
    queryFn: listJourneys
  });
  const result = journeysQuery.data;
  const journeys = result?.ok === true ? result.data : [];

  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#17211c]">
      <header className="border-b border-[#17211c21] bg-[#fffdf6]">
        <div className="mx-auto flex w-[min(1040px,calc(100%-32px))] items-center justify-between gap-4 py-4">
          <Link className="inline-flex items-center gap-3" href="/">
            <span className="grid h-[34px] w-[34px] place-items-center bg-[#eef4df] text-xl">
              🌍
            </span>
            <span>
              <strong className="block text-base leading-[1.2] font-medium">
                RouteLens
              </strong>
              <span className="block font-mono text-[0.7rem] leading-[1.2] font-bold text-[#5a6a60] uppercase">
                Journey history
              </span>
            </span>
          </Link>
          <Link
            className="border border-[#17211c] bg-[#17211c] px-3 py-2 font-mono text-[0.72rem] font-bold text-[#fffdf6] uppercase"
            href="/"
          >
            New route
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 py-8">
        <div>
          <p className="m-0 mb-2 font-mono text-[0.72rem] font-bold tracking-normal text-[#5a6a60] uppercase">
            Saved routes
          </p>
          <h1 className="m-0 text-5xl leading-[0.98] font-medium max-sm:text-[2.6rem]">
            Your generated journeys
          </h1>
        </div>

        {journeysQuery.isLoading ? (
          <div className="border border-[#17211c21] bg-[#fffdf6] p-5 text-[#405047]">
            Loading journeys...
          </div>
        ) : result?.ok === false ? (
          <div className="border border-[#a23a2540] bg-[#f7e3dc] p-5 text-[#9a412a]">
            {result.message}
          </div>
        ) : journeys.length === 0 ? (
          <div className="border border-[#17211c21] bg-[#fffdf6] p-5 text-[#405047]">
            No generated journeys yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {journeys.map((journey) => (
              <JourneyHistoryCard journey={journey} key={journey.id} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

interface JourneyHistoryCardProps {
  journey: JourneySummary;
}

function JourneyHistoryCard({ journey }: JourneyHistoryCardProps) {
  return (
    <Link
      className="grid grid-cols-[1fr_auto] gap-4 border border-[#17211c21] bg-[#fffdf6] p-4 hover:bg-[#f7f3e8] max-sm:grid-cols-1"
      href={`/journeys/${journey.id}`}
    >
      <div>
        <p className="m-0 font-mono text-[0.68rem] font-bold text-[#5a6a60] uppercase">
          {journey.status}
        </p>
        <h2 className="m-0 mt-1 text-[1.3rem] leading-[1.1] font-medium">
          {formatStyle(journey.style)} route
        </h2>
        <p className="mt-2 mb-0 text-sm leading-[1.45] text-[#405047]">
          {formatCoordinate(journey.origin)} to{" "}
          {formatCoordinate(journey.destination)}
        </p>
      </div>
      <div className="self-center border border-[#216c2f40] bg-[#eef4df] px-3 py-2 font-mono text-[0.72rem] font-bold text-[#216c2f] uppercase">
        {journey.completedImages}/{journey.totalImages} ready
      </div>
    </Link>
  );
}

function formatCoordinate(coordinate: { lat: number; lng: number }): string {
  return `${coordinate.lat.toFixed(4)}, ${coordinate.lng.toFixed(4)}`;
}

function formatStyle(style: string): string {
  return style
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
