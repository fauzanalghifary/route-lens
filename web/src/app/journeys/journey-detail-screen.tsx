"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { regenerateJourney, routeLensQueryKeys } from "@/lib/route-lens/api";
import type { JourneyDetail, JourneyScene } from "@/lib/route-lens/types";

const JourneyStaticMap = dynamic(
  () => import("./journey-static-map").then((mod) => mod.JourneyStaticMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[260px] place-items-center border border-[#17211c21] bg-[#d9e6df] font-mono text-[0.72rem] font-bold text-[#405047] uppercase">
        Loading map
      </div>
    )
  }
);

interface JourneyDetailScreenProps {
  errorMessage?: string | null;
  journey: JourneyDetail | null;
  status: "error" | "loading" | "ready";
}

export function JourneyDetailScreen({
  errorMessage,
  journey,
  status
}: JourneyDetailScreenProps) {
  const isLoading = status === "loading";
  const queryClient = useQueryClient();
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const regenerateJourneyMutation = useMutation({
    mutationFn: (variables: RegenerateJourneyVariables) =>
      regenerateJourney(variables.journeyId, {
        additionalPrompt: variables.additionalPrompt
      }),
    onSuccess: (result) => {
      if (!result.ok) {
        return;
      }

      setAdditionalPrompt("");
      queryClient.setQueryData(
        routeLensQueryKeys.journey(result.data.id),
        result
      );
      void queryClient.invalidateQueries({
        queryKey: routeLensQueryKeys.journeys()
      });
    }
  });
  const regenerationError =
    regenerateJourneyMutation.data?.ok === false
      ? regenerateJourneyMutation.data.message
      : null;
  const submitRegeneration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!journey) {
      return;
    }

    const trimmedPrompt = additionalPrompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    regenerateJourneyMutation.mutate({
      additionalPrompt: trimmedPrompt,
      journeyId: journey.id
    });
  };

  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#17211c]">
      <header className="border-b border-[#17211c21] bg-[#fffdf6]">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between gap-4 py-4">
          <Link className="inline-flex items-center gap-3" href="/">
            <span className="grid h-[34px] w-[34px] place-items-center bg-[#eef4df] text-xl">
              🌍
            </span>
            <span>
              <strong className="block text-base leading-[1.2] font-medium">
                RouteLens
              </strong>
              <span className="block font-mono text-[0.7rem] leading-[1.2] font-bold text-[#5a6a60] uppercase">
                AI route scenes
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              className="border border-[#17211c29] px-3 py-2 font-mono text-[0.72rem] font-bold text-[#24352b] uppercase"
              href="/journeys"
            >
              History
            </Link>
            <Link
              className="border border-[#17211c] bg-[#17211c] px-3 py-2 font-mono text-[0.72rem] font-bold text-[#fffdf6] uppercase"
              href="/"
            >
              New route
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 py-8">
        <section>
          <div>
            <h3 className="m-0 mb-2 font-mono text-[1.44rem] font-bold tracking-normal text-[#5a6a60] uppercase">
              {isLoading ? "Generating journey" : "Generated journey"}
            </h3>
          </div>
        </section>

        {status === "error" ? (
          <section className="border border-[#a23a2540] bg-[#f7e3dc] p-4 text-[#9a412a]">
            {errorMessage ?? "Journey could not be loaded."}
          </section>
        ) : null}

        {journey ? (
          <section className="grid gap-6">
            <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-6 max-lg:grid-cols-1">
              <JourneyStaticMap journey={journey} />
              <JourneyRouteSummary journey={journey} />
            </div>

            <SceneGallery scenes={journey.scenes} />
            <RegenerateJourneyPanel
              additionalPrompt={additionalPrompt}
              errorMessage={regenerationError}
              isPending={regenerateJourneyMutation.isPending}
              onAdditionalPromptChange={setAdditionalPrompt}
              onSubmit={submitRegeneration}
            />
          </section>
        ) : (
          <LoadingGallery />
        )}
      </div>
    </main>
  );
}

interface RegenerateJourneyVariables {
  additionalPrompt: string;
  journeyId: string;
}

interface JourneyRouteSummaryProps {
  journey: JourneyDetail;
}

function JourneyRouteSummary({ journey }: JourneyRouteSummaryProps) {
  const activeVersion = journey.scenes.reduce((max, scene) => {
    const version = scene.activeImage?.version ?? 0;
    return version > max ? version : max;
  }, 0);

  return (
    <aside className="grid content-start gap-5 border border-[#17211c21] bg-[#fffdf6] p-5">
      <div className="border-b border-[#17211c14] pb-4">
        <span className="font-mono text-[0.68rem] font-bold text-[#5a6a60] uppercase">
          Status
        </span>
        <strong className="mt-1 block text-[2.15rem] leading-none font-medium text-[#216c2f]">
          {journey.status}
        </strong>
        {activeVersion > 0 ? (
          <span className="mt-2 inline-block border border-[#216c2f40] bg-[#eef4df] px-2 py-1 font-mono text-[0.62rem] font-bold text-[#216c2f] uppercase">
            v{activeVersion} active
          </span>
        ) : null}
      </div>
      <SummaryRow label="Origin" value={formatCoordinate(journey.origin)} />
      <SummaryRow
        label="Destination"
        value={formatCoordinate(journey.destination)}
      />
    </aside>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="grid gap-1">
      <span className="font-mono text-[0.68rem] font-bold text-[#5a6a60] uppercase">
        {label}
      </span>
      <strong className="text-base leading-[1.45] font-medium text-[#17211c]">
        {value}
      </strong>
    </div>
  );
}

interface RegenerateJourneyPanelProps {
  additionalPrompt: string;
  errorMessage: string | null;
  isPending: boolean;
  onAdditionalPromptChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function RegenerateJourneyPanel({
  additionalPrompt,
  errorMessage,
  isPending,
  onAdditionalPromptChange,
  onSubmit
}: RegenerateJourneyPanelProps) {
  const canSubmit = additionalPrompt.trim().length > 0 && !isPending;

  return (
    <form
      className="grid gap-4 border border-[#17211c21] bg-[#fffdf6] p-4"
      onSubmit={onSubmit}
    >
      <div className="grid gap-1">
        <p className="m-0 font-mono text-[0.68rem] font-bold text-[#5a6a60] uppercase">
          Regenerate image
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_190px] gap-3 max-sm:grid-cols-1">
        <input
          className="min-h-11 border border-[#17211c29] bg-[#fffdf6] px-3 text-base text-[#17211c] outline-none focus:border-[#216c2f] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          maxLength={500}
          placeholder="make it rainy"
          type="text"
          value={additionalPrompt}
          onChange={(event) => onAdditionalPromptChange(event.target.value)}
        />
        <button
          className="min-h-11 border border-[#216c2f] bg-[#eef4df] px-4 font-mono text-[0.72rem] font-bold text-[#216c2f] uppercase disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSubmit}
          type="submit"
        >
          {isPending ? "Regenerating..." : "Regenerate"}
        </button>
      </div>

      {errorMessage ? (
        <p className="m-0 border border-[#a23a2540] bg-[#f7e3dc] px-3 py-2 text-sm text-[#9a412a]">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}

interface SceneGalleryProps {
  scenes: JourneyScene[];
}

function SceneGallery({ scenes }: SceneGalleryProps) {
  return (
    <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-2 max-md:grid-cols-1">
      {scenes
        .toSorted((left, right) => left.order - right.order)
        .map((scene) => (
          <SceneCard key={scene.id} scene={scene} />
        ))}
    </div>
  );
}

interface SceneCardProps {
  scene: JourneyScene;
}

function SceneCard({ scene }: SceneCardProps) {
  return (
    <article className="grid min-h-0 gap-3 border border-[#17211c21] bg-[#fffdf6] p-3">
      <div>
        <p className="m-0 font-mono text-[0.68rem] font-bold text-[#5a6a60] uppercase">
          Scene {scene.order}
        </p>
        <h2 className="m-0 mt-1 text-[1.18rem] leading-[1.05] font-medium text-[#17211c]">
          {formatSceneLabel(scene.label)}
        </h2>
      </div>

      <div className="aspect-[4/3] overflow-hidden bg-[#d9e6df]">
        {scene.activeImage?.imageUrl ? (
          <img
            alt={`${formatSceneLabel(scene.label)} generated scene`}
            className="h-full w-full object-cover"
            src={scene.activeImage.imageUrl}
          />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center font-mono text-[0.72rem] font-bold text-[#405047] uppercase">
            Image pending
          </div>
        )}
      </div>
    </article>
  );
}

function LoadingGallery() {
  return (
    <section className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
      {[1, 2, 3].map((sceneNumber) => (
        <article
          className="grid gap-3 border border-[#17211c21] bg-[#fffdf6] p-3"
          key={sceneNumber}
        >
          <div>
            <p className="m-0 font-mono text-[0.68rem] font-bold text-[#5a6a60] uppercase">
              Scene {sceneNumber}
            </p>
            <h2 className="m-0 mt-1 text-[1.18rem] leading-[1.05] font-medium text-[#17211c]">
              Preparing
            </h2>
          </div>
          <div className="grid aspect-[4/3] place-items-center bg-[#d9e6df] font-mono text-[0.72rem] font-bold text-[#405047] uppercase">
            Generating
          </div>
        </article>
      ))}
    </section>
  );
}

function formatCoordinate(
  coordinate: CoordinateLike | null | undefined
): string {
  if (!coordinate) {
    return "Pending";
  }

  return `${coordinate.lat.toFixed(4)}, ${coordinate.lng.toFixed(4)}`;
}

interface CoordinateLike {
  lat: number;
  lng: number;
}

function formatSceneLabel(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}
