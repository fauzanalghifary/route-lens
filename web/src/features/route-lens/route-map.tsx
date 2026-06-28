"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { FeatureCollection, LineString } from "geojson";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import type { Coordinate } from "./route-lens.types";

interface RouteMapProps {
  destination: Coordinate | null;
  origin: Coordinate | null;
  onPick: (coordinate: Coordinate) => void;
}

const jakartaCenter: [number, number] = [106.8456, -6.2088];

const routeSourceId = "route-preview";

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

const emptyRoutePreview: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: []
};

export function RouteMap({ destination, origin, onPick }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onPickRef = useRef(onPick);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: jakartaCenter,
      zoom: 11,
      attributionControl: {
        compact: true
      }
    });

    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("click", (event) => {
      onPickRef.current({
        lat: event.lngLat.lat,
        lng: event.lngLat.lng
      });
    });

    map.on("load", () => {
      map.addSource(routeSourceId, {
        type: "geojson",
        data: emptyRoutePreview
      });

      map.addLayer({
        id: "route-preview-casing",
        type: "line",
        source: routeSourceId,
        paint: {
          "line-color": "#fffdf8",
          "line-width": 8,
          "line-opacity": 0.92
        }
      });

      map.addLayer({
        id: "route-preview-line",
        type: "line",
        source: routeSourceId,
        paint: {
          "line-color": "#cf624a",
          "line-width": 4,
          "line-opacity": 0.95
        }
      });
    });

    return () => {
      removeMarker(originMarkerRef);
      removeMarker(destinationMarkerRef);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    syncMarker(map, originMarkerRef, origin, "origin");
    syncMarker(map, destinationMarkerRef, destination, "destination");
    syncRoutePreview(map, origin, destination);
  }, [destination, origin]);

  return (
    <div className="route-map-shell">
      <div ref={containerRef} className="route-map" />
    </div>
  );
}

function syncMarker(
  map: maplibregl.Map | null,
  markerRef: MutableRefObject<maplibregl.Marker | null>,
  coordinate: Coordinate | null,
  variant: "destination" | "origin"
) {
  if (!coordinate) {
    markerRef.current?.remove();
    markerRef.current = null;
    return;
  }

  if (markerRef.current) {
    markerRef.current.setLngLat([coordinate.lng, coordinate.lat]);
    return;
  }

  if (!map) {
    return;
  }

  markerRef.current = new maplibregl.Marker({
    element: createMarkerElement(variant),
    anchor: "bottom"
  })
    .setLngLat([coordinate.lng, coordinate.lat])
    .addTo(map);

  map.easeTo({
    center: [coordinate.lng, coordinate.lat],
    duration: 550
  });
}

function syncRoutePreview(
  map: maplibregl.Map | null,
  origin: Coordinate | null,
  destination: Coordinate | null
) {
  if (!map || !map.isStyleLoaded()) {
    return;
  }

  const source = map.getSource(routeSourceId);

  if (!(source instanceof maplibregl.GeoJSONSource)) {
    return;
  }

  source.setData(
    origin && destination
      ? createRoutePreview(origin, destination)
      : emptyRoutePreview
  );
}

function createRoutePreview(
  origin: Coordinate,
  destination: Coordinate
): FeatureCollection<LineString> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [origin.lng, origin.lat],
            [destination.lng, destination.lat]
          ]
        }
      }
    ]
  };
}

function createMarkerElement(variant: "destination" | "origin") {
  const element = document.createElement("div");
  element.className = `route-marker route-marker-${variant}`;
  element.setAttribute(
    "aria-label",
    variant === "origin" ? "Origin" : "Destination"
  );
  return element;
}

function removeMarker(markerRef: MutableRefObject<maplibregl.Marker | null>) {
  markerRef.current?.remove();
  markerRef.current = null;
}
