import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/utils/cn";

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const customIcon = (color: string) =>
  new L.DivIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); position: relative;">
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid white;"></div>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

interface Location {
  lat: number;
  lng: number;
  label?: string;
}

interface MapViewProps {
  pickup?: Location;
  drop?: Location;
  driverLocation?: Location;
  showRoute?: boolean;
  onMarkerDrag?: (type: "pickup" | "drop", lat: number, lng: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  isPickingLocation?: boolean;
  className?: string;
}

function MapEvents({ onMapClick, isPickingLocation }: { onMapClick?: (lat: number, lng: number) => void, isPickingLocation?: boolean }) {
  useMapEvents({
    click(e) {
      if (isPickingLocation && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function MapUpdater({ pickup, drop, driverLocation, routeCoords }: MapViewProps & { routeCoords?: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([]);
    let hasPoint = false;

    if (pickup) { bounds.extend([pickup.lat, pickup.lng]); hasPoint = true; }
    if (drop) { bounds.extend([drop.lat, drop.lng]); hasPoint = true; }
    if (driverLocation) { bounds.extend([driverLocation.lat, driverLocation.lng]); hasPoint = true; }

    if (routeCoords && routeCoords.length > 0) {
      routeCoords.forEach(coord => bounds.extend(coord));
      hasPoint = true;
    }

    if (hasPoint && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [map, pickup, drop, driverLocation, routeCoords]);

  return null;
}

export function MapView({ pickup, drop, driverLocation, showRoute = true, onMarkerDrag, onMapClick, isPickingLocation, className }: MapViewProps) {
  const defaultCenter: [number, number] = [19.076, 72.8777]; // Mumbai
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (showRoute && pickup && drop) {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            setRouteCoords(coords);
          }
        } catch (error) {
          console.error("Failed to fetch route geometry:", error);
        }
      } else {
        setRouteCoords([]);
      }
    };

    fetchRoute();
  }, [pickup, drop, showRoute]);

  const pickupIcon = useMemo(() => customIcon("#10b981"), []);
  const dropIcon = useMemo(() => customIcon("#ef4444"), []);
  const driverIcon = useMemo(() => customIcon("#4f46e5"), []);

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm z-0 relative", className)}>
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-xl animate-pulse tracking-wider">
          Tap map to pinpoint location
        </div>
      )}
      <MapContainer
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full min-h-[300px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {pickup && (
          <Marker
            position={[pickup.lat, pickup.lng]}
            icon={pickupIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                if (onMarkerDrag) onMarkerDrag("pickup", position.lat, position.lng);
              },
            }}
          >
            <Popup className="font-bold">Pickup: {pickup.label || "Exact Location"}</Popup>
          </Marker>
        )}
        
        {drop && (
          <Marker
            position={[drop.lat, drop.lng]}
            icon={dropIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                if (onMarkerDrag) onMarkerDrag("drop", position.lat, position.lng);
              },
            }}
          >
            <Popup className="font-bold">Drop-off: {drop.label || "Exact Location"}</Popup>
          </Marker>
        )}
        
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>{driverLocation.label || "Driver Location"}</Popup>
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#4f46e5"
            weight={5}
            opacity={0.8}
            lineJoin="round"
          />
        )}

        <MapEvents onMapClick={onMapClick} isPickingLocation={isPickingLocation} />
        <MapUpdater pickup={pickup} drop={drop} driverLocation={driverLocation} routeCoords={routeCoords} />
      </MapContainer>
    </div>
  );
}
