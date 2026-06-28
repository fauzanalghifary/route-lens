"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { regenerateJourney, routeLensQueryKeys } from "@/lib/route-lens/api";
import type {
  CreateJourneyRequest,
  JourneyDetail,
  SceneImage,
  JourneyScene
} from "@/lib/route-lens/types";

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
  pendingRequest?: CreateJourneyRequest | null;
  status: "error" | "loading" | "ready";
}

export function JourneyDetailScreen({
  errorMessage,
  journey,
  pendingRequest,
  status
}: JourneyDetailScreenProps) {
  const isLoading = status === "loading";
  const queryClient = useQueryClient();
  const regenerateJourneyMutation = useMutation({
    mutationFn: (journeyId: string) => regenerateJourney(journeyId),
    onSuccess: (result) => {
      if (!result.ok) {
        return;
      }

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
        <section className="grid grid-cols-[minmax(0,1fr)_360px] gap-6 max-lg:grid-cols-1">
          <div>
            <p className="m-0 mb-2 font-mono text-[0.72rem] font-bold tracking-normal text-[#5a6a60] uppercase">
              {isLoading ? "Generating journey" : "Generated journey"}
            </p>
            <h1 className="m-0 max-w-[720px] text-5xl leading-[0.98] font-medium max-sm:text-[2.6rem]">
              {journey
                ? `${formatStyle(journey.style)} scenes are ready`
                : "Preparing your route scenes"}
            </h1>
            <p className="mt-4 mb-0 max-w-[68ch] text-[1.02rem] leading-[1.55] text-[#405047]">
              AI-generated scenes inspired by the geography along your route.
              These are visual impressions, not exact real-world street views.
            </p>
          </div>

          <aside className="grid gap-3 border border-[#17211c21] bg-[#fffdf6] p-4">
            <SummaryRow
              label="Status"
              value={journey?.status ?? (isLoading ? "creating" : "error")}
            />
            <SummaryRow
              label="Origin"
              value={formatCoordinate(
                journey?.origin ?? pendingRequest?.origin
              )}
            />
            <SummaryRow
              label="Destination"
              value={formatCoordinate(
                journey?.destination ?? pendingRequest?.destination
              )}
            />
            <SummaryRow
              label="Images"
              value={
                journey
                  ? `${journey.completedImages}/${journey.totalImages} ready`
                  : "Starting"
              }
            />
            {journey ? (
              <button
                className="mt-1 min-h-10 border border-[#216c2f] bg-[#eef4df] px-3 font-mono text-[0.68rem] font-bold text-[#216c2f] uppercase disabled:cursor-not-allowed disabled:opacity-60"
                disabled={regenerateJourneyMutation.isPending}
                type="button"
                onClick={() => regenerateJourneyMutation.mutate(journey.id)}
              >
                {regenerateJourneyMutation.isPending
                  ? "Regenerating..."
                  : "Regenerate all scenes"}
              </button>
            ) : null}
          </aside>
        </section>

        {status === "error" ? (
          <section className="border border-[#a23a2540] bg-[#f7e3dc] p-4 text-[#9a412a]">
            {errorMessage ?? "Journey could not be loaded."}
          </section>
        ) : null}

        {regenerationError ? (
          <section className="border border-[#a23a2540] bg-[#f7e3dc] p-4 text-[#9a412a]">
            {regenerationError}
          </section>
        ) : null}

        {journey ? (
          <section className="grid gap-6">
            <div className="grid grid-cols-[420px_minmax(0,1fr)] gap-6 max-lg:grid-cols-1">
              <JourneyStaticMap journey={journey} />
              <div className="grid gap-2 border border-[#17211c21] bg-[#fffdf6] p-4">
                {journey.scenes
                  .toSorted((left, right) => left.order - right.order)
                  .map((scene) => (
                    <div
                      className="flex items-center justify-between gap-3 border-b border-[#17211c14] pb-2 last:border-b-0 last:pb-0"
                      key={scene.id}
                    >
                      <span className="font-mono text-[0.7rem] font-bold text-[#5a6a60] uppercase">
                        {scene.order}. {formatSceneLabel(scene.label)}
                      </span>
                      <span className="text-sm text-[#405047]">
                        {formatCoordinate(scene)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <SceneGallery scenes={journey.scenes} />
          </section>
        ) : (
          <LoadingGallery />
        )}
      </div>
    </main>
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
  const activePrompt = scene.activeImage?.prompt ?? "";

  return (
    <article className="grid min-h-0 gap-3 border border-[#17211c21] bg-[#fffdf6] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 font-mono text-[0.68rem] font-bold text-[#5a6a60] uppercase">
            Scene {scene.order}
          </p>
          <h2 className="m-0 mt-1 text-[1.18rem] leading-[1.05] font-medium text-[#17211c]">
            {formatSceneLabel(scene.label)}
          </h2>
        </div>
        <span className="shrink-0 border border-[#216c2f40] bg-[#eef4df] px-2 py-1 font-mono text-[0.62rem] font-bold text-[#216c2f] uppercase">
          {scene.activeImage
            ? `v${scene.activeImage.version} active`
            : "pending"}
        </span>
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

      <p className="m-0 line-clamp-4 text-[0.86rem] leading-[1.45] text-[#405047]">
        {activePrompt || "Prompt pending."}
      </p>

      <SceneImageHistory
        activeImageId={scene.activeImage?.id ?? null}
        images={scene.images}
      />
    </article>
  );
}

interface SceneImageHistoryProps {
  activeImageId: string | null;
  images: SceneImage[];
}

function SceneImageHistory({ activeImageId, images }: SceneImageHistoryProps) {
  return (
    <div className="grid gap-2 border-t border-[#17211c14] pt-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] font-bold text-[#5a6a60] uppercase">
          Image history
        </span>
        <span className="font-mono text-[0.64rem] font-bold text-[#405047] uppercase">
          {images.length} {images.length === 1 ? "version" : "versions"}
        </span>
      </div>

      <div className="grid gap-2">
        {images
          .toSorted((left, right) => right.version - left.version)
          .map((image) => (
            <div
              className="grid gap-1 border border-[#17211c14] bg-[#fffdf6] p-2"
              key={image.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[0.64rem] font-bold text-[#24352b] uppercase">
                  Version {image.version}
                </span>
                <span className="font-mono text-[0.6rem] font-bold text-[#5a6a60] uppercase">
                  {image.id === activeImageId ? "active" : image.status}
                </span>
              </div>
              <p className="m-0 line-clamp-2 text-[0.76rem] leading-[1.35] text-[#405047]">
                {image.prompt}
              </p>
            </div>
          ))}
      </div>
    </div>
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

function formatStyle(style: string): string {
  return style
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
