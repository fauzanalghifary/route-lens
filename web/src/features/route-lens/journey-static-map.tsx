"use client";

import { useEffect, useMemo, useRef } from "react";
import type { FeatureCollection, LineString } from "geojson";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import type {
  Coordinate,
  JourneyDetail,
  JourneyScene
} from "./route-lens.types";

interface JourneyStaticMapProps {
  journey: JourneyDetail;
}

const routeSourceId = "journey-route-preview";

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm"
    }
  ]
};

export function JourneyStaticMap({ journey }: JourneyStaticMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  const points = useMemo(() => getJourneyPoints(journey), [journey]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [journey.origin.lng, journey.origin.lat],
      zoom: 2,
      interactive: false,
      attributionControl: {
        compact: true
      }
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource(routeSourceId, {
        type: "geojson",
        data: createRoutePreview(points)
      });

      map.addLayer({
        id: "journey-route-preview-casing",
        type: "line",
        source: routeSourceId,
        paint: {
          "line-color": "#fffdf6",
          "line-width": 7,
          "line-opacity": 0.9
        }
      });

      map.addLayer({
        id: "journey-route-preview-line",
        type: "line",
        source: routeSourceId,
        paint: {
          "line-color": "#315f54",
          "line-width": 3,
          "line-opacity": 0.95
        }
      });

      markerRefs.current = points.map((point, index) =>
        new maplibregl.Marker({
          element: createStaticMarkerElement(index + 1),
          anchor: "center"
        })
          .setLngLat([point.lng, point.lat])
          .addTo(map)
      );

      fitMapToPoints(map, points);
    });

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [journey.origin.lat, journey.origin.lng, points]);

  return (
    <div className="h-[260px] overflow-hidden border border-[#17211c21] bg-[#d9e6df]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

function getJourneyPoints(journey: JourneyDetail): Coordinate[] {
  return [
    journey.origin,
    ...journey.scenes
      .toSorted((left, right) => left.order - right.order)
      .map(toCoordinate),
    journey.destination
  ];
}

function toCoordinate(scene: JourneyScene): Coordinate {
  return {
    lat: scene.lat,
    lng: scene.lng
  };
}

function createRoutePreview(
  points: Coordinate[]
): FeatureCollection<LineString> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: points.map((point) => [point.lng, point.lat])
        }
      }
    ]
  };
}

function createStaticMarkerElement(index: number) {
  const element = document.createElement("div");
  element.className =
    "grid h-7 w-7 place-items-center rounded-full border-2 border-[#fffdf6] bg-[#17211c] font-mono text-[0.68rem] font-bold text-[#fffdf6] shadow-[0_8px_18px_rgba(23,33,28,0.28)]";
  element.textContent = String(index);

  return element;
}

function fitMapToPoints(map: maplibregl.Map, points: Coordinate[]) {
  const bounds = new maplibregl.LngLatBounds();

  points.forEach((point) => bounds.extend([point.lng, point.lat]));

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      duration: 0,
      maxZoom: 5,
      padding: 42
    });
  }
}
