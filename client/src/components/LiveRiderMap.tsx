import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Order, DeliveryLocation } from '../types';
import { deliveryService } from '../services/api';
import { subscribeToLocationUpdates, broadcastRiderLocation } from '../services/socket';
import {
  Bike,
  Store,
  MapPin,
  Navigation,
  Compass,
  Battery,
  Phone,
  RotateCw,
  Zap,
  Play,
  Pause,
  CheckCircle,
  ShieldCheck,
  Layers,
  LocateFixed,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface LiveRiderMapProps {
  order: Order;
  height?: string;
  showControls?: boolean;
  onOrderUpdated?: (order: Order) => void;
}

// Fallback high-fidelity road waypoints in Rewa, MP (Connecting Sirmour Chauraha -> Hospital Rd -> Kothi -> Civil Lines -> Bodhagbag)
const DEFAULT_REWA_ROAD_WAYPOINTS: [number, number][] = [
  [24.5362, 81.3037], // Sirmour Chauraha (Store)
  [24.5368, 81.3032],
  [24.5375, 81.3025],
  [24.5381, 81.3018],
  [24.5389, 81.3011],
  [24.5395, 81.3005], // Hospital Rd Junction
  [24.5401, 81.2998],
  [24.5408, 81.2991],
  [24.5413, 81.2982], // Kothi Compound Turn
  [24.5417, 81.2974],
  [24.5420, 81.2965], // Civil Lines / Destination
];

// Helper to calculate bearing angle between two lat/lng points
const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number): number => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const bearingRad = Math.atan2(y, x);
  return (Math.round((bearingRad * 180) / Math.PI) + 360) % 360;
};

// Calculate geodesic distance in km
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

export const LiveRiderMap: React.FC<LiveRiderMapProps> = ({
  order,
  height = '420px',
  showControls = true,
  onOrderUpdated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const traveledPolylineRef = useRef<L.Polyline | null>(null);
  const remainingPolylineRef = useRef<L.Polyline | null>(null);

  // Map Tile Style ('google-streets' | 'google-satellite' | 'carto-light')
  const [mapLayer, setMapLayer] = useState<'google-streets' | 'google-satellite' | 'carto-light'>('google-streets');

  // Road Waypoints connecting Store -> Destination
  const [roadWaypoints, setRoadWaypoints] = useState<[number, number][]>(DEFAULT_REWA_ROAD_WAYPOINTS);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);

  // Auto-follow rider camera
  const [autoFollow, setAutoFollow] = useState<boolean>(true);

  // Simulation controls
  const [simulating, setSimulating] = useState<boolean>(false);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Interactive tip feedback
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [tipMessage, setTipMessage] = useState<string | null>(null);

  // Coordinates
  const shopCoord: [number, number] = useMemo(
    () => [order.shopLocation?.lat || 24.5362, order.shopLocation?.lng || 81.3037],
    [order.shopLocation]
  );

  const destCoord: [number, number] = useMemo(
    () => [order.destinationLocation?.lat || 24.542, order.destinationLocation?.lng || 81.2965],
    [order.destinationLocation]
  );

  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation>(() => {
    return (
      order.deliveryLocation || {
        lat: shopCoord[0],
        lng: shopCoord[1],
        speed: 28,
        heading: 315,
        statusText: 'Rider en route to delivery destination',
        batteryLevel: 88,
        lastUpdated: new Date().toISOString(),
      }
    );
  });

  // Fetch true turn-by-turn road route from OSRM
  useEffect(() => {
    let isMounted = true;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${shopCoord[1]},${shopCoord[0]};${destCoord[1]},${destCoord[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates?.length > 0 && isMounted) {
          // OSRM returns [lng, lat], Leaflet requires [lat, lng]
          const mapped: [number, number][] = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );
          setRoadWaypoints(mapped);
        }
      } catch (e) {
        // Silently use pre-configured high-accuracy Rewa road waypoints
        setRoadWaypoints(DEFAULT_REWA_ROAD_WAYPOINTS);
      }
    };

    fetchRoute();
    return () => {
      isMounted = false;
    };
  }, [shopCoord, destCoord]);

  // Synchronize internal state when prop changes
  useEffect(() => {
    if (order.deliveryLocation) {
      setCurrentLocation(order.deliveryLocation);
    }
  }, [order.deliveryLocation]);

  // Subscribe to real-time WebSocket rider coordinate updates
  useEffect(() => {
    const unsub = subscribeToLocationUpdates(({ orderId, deliveryLocation }) => {
      if (orderId === order._id && deliveryLocation) {
        setCurrentLocation(deliveryLocation);
      }
    });
    return unsub;
  }, [order._id]);

  // Helper to create custom HTML markers
  const createHtmlIcon = (htmlContent: string, className: string, iconSize: [number, number] = [40, 40]) => {
    return L.divIcon({
      html: htmlContent,
      className,
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
    });
  };

  // Switch Tile Layer smoothly
  const updateMapTileLayer = (layerType: 'google-streets' | 'google-satellite' | 'carto-light') => {
    if (!mapInstanceRef.current) return;
    if (activeTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(activeTileLayerRef.current);
    }

    let tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    let subdomains: string[] | string = ['mt0', 'mt1', 'mt2', 'mt3'];
    let maxZoom = 20;
    let attribution = '© Google Maps';

    if (layerType === 'google-satellite') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attribution = '© Google Satellite / Hybrid';
    } else if (layerType === 'carto-light') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
      attribution = '© CARTO, © OpenStreetMap';
      maxZoom = 19;
    }

    const newLayer = L.tileLayer(tileUrl, {
      subdomains,
      maxZoom,
      attribution,
    }).addTo(mapInstanceRef.current);

    activeTileLayerRef.current = newLayer;
    setMapLayer(layerType);
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 15,
      zoomControl: false,
    });

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Google Street Layer
    const defaultLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
      attribution: '© Google Maps',
    }).addTo(map);
    activeTileLayerRef.current = defaultLayer;

    // 🏬 Store Marker (Blue Pill with Shop Icon & Name)
    const storeIconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background-color: #0f172a; color: #ffffff; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1.5px solid #2563eb; display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #38bdf8;"></span>
          ${order.shopName.length > 20 ? order.shopName.slice(0, 18) + '...' : order.shopName}
        </div>
        <div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 12px rgba(37,99,235,0.45);">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
        </div>
      </div>
    `;
    const storeMarker = L.marker(shopCoord, {
      icon: createHtmlIcon(storeIconHtml, 'store-zomato-pin', [130, 60]),
      zIndexOffset: 500,
    }).addTo(map);
    storeMarker.bindPopup(`<strong>${order.shopName}</strong><br/>Pickup Store (Rewa, MP)`);

    // 🏠 Destination Marker (Orange Pill with House Icon & Pulsing Halo)
    const destIconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background-color: #c2410c; color: #ffffff; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1.5px solid white; display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #fb923c;"></span>
          ${order.userName || 'Delivery Destination'}
        </div>
        <div style="position: relative; background-color: #ea580c; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 14px rgba(234,88,12,0.5); animation: destinationPulse 2.2s infinite;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
      </div>
    `;
    const destMarker = L.marker(destCoord, {
      icon: createHtmlIcon(destIconHtml, 'dest-zomato-pin', [130, 60]),
      zIndexOffset: 500,
    }).addTo(map);
    destMarker.bindPopup(`<strong>Delivery Destination</strong><br/>${order.deliveryAddress}`);

    // 🛵 3D Zomato / Swiggy Rotating Delivery Bike Marker
    const riderHtml = `
      <div id="zomato-scooter-container" style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
        <!-- Concentric Radar Pulsing Rings -->
        <div class="zomato-radar-beacon"></div>
        <div class="zomato-radar-beacon-secondary"></div>
        
        <!-- Live Speed Pill Above Bike -->
        <div style="position: absolute; top: -14px; background-color: #0f172a; color: #34d399; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; border: 1px solid #10b981; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 100;">
          🛵 ${currentLocation.speed || 28} km/h
        </div>

        <!-- Rotating 3D Scooter Icon -->
        <div id="zomato-scooter-rotator" style="position: relative; width: 44px; height: 44px; transform: rotate(${currentLocation.heading || 0}deg); transition: transform 0.4s ease-out; display: flex; align-items: center; justify-content: center;">
          <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
            <!-- Scooter Shadow -->
            <ellipse cx="24" cy="24" rx="20" ry="14" fill="rgba(0,0,0,0.18)" />
            <!-- Headlight Beam -->
            <polygon points="24,2 17,20 31,20" fill="url(#headlightGrad)" opacity="0.6" />
            <!-- Scooter Body (Chassis) -->
            <rect x="21" y="8" width="6" height="32" rx="3" fill="#0f172a" />
            <!-- Front Fender & Handlebars -->
            <rect x="15" y="10" width="18" height="4" rx="2" fill="#334155" />
            <circle cx="16" cy="12" r="2.5" fill="#10b981" />
            <circle cx="32" cy="12" r="2.5" fill="#10b981" />
            <!-- Front Headlight -->
            <circle cx="24" cy="8" r="3" fill="#fef08a" stroke="#ca8a04" stroke-width="1" />
            <!-- Rider Helmet -->
            <circle cx="24" cy="22" r="5" fill="#30e849" stroke="#064e3b" stroke-width="1.5" />
            <rect x="22" y="19" width="4" height="2" rx="1" fill="#ffffff" />
            <!-- Rear Delivery Box (Onbuggy Brand) -->
            <rect x="18" y="29" width="12" height="11" rx="2.5" fill="#ff4500" stroke="#9a3412" stroke-width="1" />
            <rect x="21" y="32" width="6" height="5" rx="1" fill="#ffffff" opacity="0.9" />
            <!-- Defs -->
            <defs>
              <linearGradient id="headlightGrad" x1="24" y1="2" x2="24" y2="20" gradientUnits="userSpaceOnUse">
                <stop stop-color="#fef08a" stop-opacity="0.8"/>
                <stop offset="1" stop-color="#fef08a" stop-opacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    `;

    const riderMarker = L.marker([currentLocation.lat, currentLocation.lng], {
      icon: createHtmlIcon(riderHtml, 'smooth-rider-marker', [56, 56]),
      zIndexOffset: 1000,
    }).addTo(map);

    riderMarker.bindPopup(`
      <strong>${order.deliveryPersonnel || 'Sunil Verma'}</strong><br/>
      Vehicle: Hero Splendor (MP-17-AB-4021)<br/>
      Live Speed: ${currentLocation.speed || 28} km/h • Battery: ${currentLocation.batteryLevel || 88}%
    `);
    riderMarkerRef.current = riderMarker;

    // Initial bounding fit
    const bounds = L.latLngBounds([shopCoord, [currentLocation.lat, currentLocation.lng], destCoord]);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update Route Polylines whenever road waypoints or rider location updates
  useEffect(() => {
    if (!mapInstanceRef.current || roadWaypoints.length === 0) return;
    const map = mapInstanceRef.current;

    // Find the waypoint closest to current rider position
    let closestIndex = 0;
    let minDistance = Infinity;

    roadWaypoints.forEach((wp, idx) => {
      const dist = calculateDistanceKm(currentLocation.lat, currentLocation.lng, wp[0], wp[1]);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setCurrentWaypointIndex(closestIndex);

    const riderCoord: [number, number] = [currentLocation.lat, currentLocation.lng];
    const traveledPath = [...roadWaypoints.slice(0, closestIndex), riderCoord];
    const remainingPath = [riderCoord, ...roadWaypoints.slice(closestIndex + 1)];

    // Clear old polylines
    if (traveledPolylineRef.current) map.removeLayer(traveledPolylineRef.current);
    if (remainingPolylineRef.current) map.removeLayer(remainingPolylineRef.current);

    // 1. Traveled Path: Soft dashed line
    const traveledLine = L.polyline(traveledPath, {
      color: '#94a3b8',
      weight: 4,
      opacity: 0.65,
      dashArray: '6, 6',
    }).addTo(map);
    traveledPolylineRef.current = traveledLine;

    // 2. Remaining Active Path: Vibrant Glowing Google/Zomato road line
    const remainingLine = L.polyline(remainingPath, {
      color: '#059669',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    remainingPolylineRef.current = remainingLine;
  }, [roadWaypoints, currentLocation]);

  // 3. Smoothly reposition and rotate rider marker
  useEffect(() => {
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);

      // Rotate bike smoothly
      const rotator = document.getElementById('zomato-scooter-rotator');
      if (rotator) {
        rotator.style.transform = `rotate(${currentLocation.heading || 0}deg)`;
      }

      // If autoFollow is enabled, smoothly pan map
      if (autoFollow && mapInstanceRef.current) {
        mapInstanceRef.current.panTo([currentLocation.lat, currentLocation.lng], {
          animate: true,
          duration: 0.6,
        });
      }
    }
  }, [currentLocation, autoFollow]);

  // Center on rider
  const handleCenterRider = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([currentLocation.lat, currentLocation.lng], {
        animate: true,
        duration: 0.8,
      });
    }
  };

  // Fit entire delivery route
  const handleFitEntireRoute = () => {
    if (mapInstanceRef.current && roadWaypoints.length > 0) {
      const bounds = L.latLngBounds(roadWaypoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Perform single step simulation along road waypoints
  const handleSimulateStep = async () => {
    setSimulating(true);
    try {
      if (roadWaypoints.length > 1) {
        const nextIdx = Math.min(roadWaypoints.length - 1, currentWaypointIndex + 1);
        const nextPt = roadWaypoints[nextIdx];
        const prevPt = roadWaypoints[Math.max(0, nextIdx - 1)];

        const heading = calculateBearing(prevPt[0], prevPt[1], nextPt[0], nextPt[1]);
        const speed = nextIdx === roadWaypoints.length - 1 ? 0 : Math.floor(Math.random() * 10) + 24;
        const statusText =
          nextIdx === roadWaypoints.length - 1
            ? 'Arrived at delivery location!'
            : `Cruising along Rewa route (${calculateDistanceKm(nextPt[0], nextPt[1], destCoord[0], destCoord[1])} km left)`;

        const newLoc: DeliveryLocation = {
          lat: Number(nextPt[0].toFixed(6)),
          lng: Number(nextPt[1].toFixed(6)),
          heading,
          speed,
          batteryLevel: Math.max(20, (currentLocation.batteryLevel || 88) - 1),
          statusText,
          lastUpdated: new Date().toISOString(),
        };

        setCurrentLocation(newLoc);
        setCurrentWaypointIndex(nextIdx);

        // Broadcast over WebSocket so all stakeholder screens update
        broadcastRiderLocation({
          orderId: order._id,
          lat: newLoc.lat,
          lng: newLoc.lng,
          speed: newLoc.speed,
          heading: newLoc.heading,
          batteryLevel: newLoc.batteryLevel,
          statusText: newLoc.statusText,
        });

        // Also persist on backend
        await deliveryService.updateLocation(order._id, newLoc);

        if (onOrderUpdated) {
          onOrderUpdated({ ...order, deliveryLocation: newLoc });
        }
      } else {
        // Fallback to backend simulator
        const res = await deliveryService.simulateStep(order._id);
        if (res.data.success && res.data.data.deliveryLocation) {
          setCurrentLocation(res.data.data.deliveryLocation);
          if (onOrderUpdated) {
            onOrderUpdated({ ...order, deliveryLocation: res.data.data.deliveryLocation });
          }
        }
      }
    } catch (err) {
      console.error('Failed to step delivery simulation:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Auto-simulation interval
  useEffect(() => {
    if (!autoSimulate) return;
    const intervalMs = Math.max(1000, Math.round(3000 / simSpeed));
    const interval = setInterval(() => {
      handleSimulateStep();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [autoSimulate, currentWaypointIndex, roadWaypoints, simSpeed]);

  // Calculate live ETA and progress
  const distRemainingKm = calculateDistanceKm(currentLocation.lat, currentLocation.lng, destCoord[0], destCoord[1]);
  const totalRouteDistKm =
    roadWaypoints.length > 1
      ? calculateDistanceKm(shopCoord[0], shopCoord[1], destCoord[0], destCoord[1])
      : 2.4;

  const progressPercent = Math.min(
    100,
    Math.max(
      5,
      Math.round(((totalRouteDistKm - distRemainingKm) / (totalRouteDistKm || 1)) * 100)
    )
  );

  const etaMinutes = Math.max(1, Math.round(distRemainingKm * 2.8));

  // Handle Tip click
  const handleTipRider = (amount: number) => {
    setSelectedTip(amount);
    setTipMessage(`🎉 ₹${amount} Tip added for ${order.deliveryPersonnel || 'Sunil Verma'}! Thank you for supporting our delivery partner.`);
    setTimeout(() => setTipMessage(null), 5000);
  };

  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        position: 'relative',
      }}
    >
      {/* 1. TOP FLOATING ZOMATO/SWIGGY LIVE ETA & TRAFFIC PILL */}
      <div
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: '#10b981',
                  color: '#064e3b',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Zap size={11} fill="#064e3b" /> ON TIME
              </span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Order #{order.orderNumber}
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '4px 0 2px', letterSpacing: '-0.3px', color: '#ffffff' }}>
              Arriving in <span style={{ color: '#34d399' }}>{etaMinutes} Mins</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
              {distRemainingKm > 0.05
                ? `${distRemainingKm} km away • ${currentLocation.statusText || 'Rider proceeding on route'}`
                : '🛵 Rider has reached your doorstep!'}
            </p>
          </div>

          {/* Right Telemetry Gauges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Speed</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>
                {currentLocation.speed || 28} <span style={{ fontSize: '0.7rem' }}>km/h</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Battery</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4ade80' }}>
                {currentLocation.batteryLevel || 88}%
              </div>
            </div>
          </div>
        </div>

        {/* Live Trip Progress Bar */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
            <span>Store: {order.shopName}</span>
            <span>{progressPercent}% Journey Completed</span>
            <span>Doorstep</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: '#30e849',
                borderRadius: '9999px',
                transition: 'width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
                boxShadow: '0 0 10px rgba(48,232,73,0.8)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. MAP CANVAS WITH FLOATING GOOGLE LAYER CONTROLS */}
      <div style={{ position: 'relative', width: '100%', height }}>
        {/* Leaflet Map Div */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#e2e8f0',
          }}
        />

        {/* Floating Google Maps Layer Switcher Pill (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000,
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            padding: '3px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            border: '1px solid #cbd5e1',
            gap: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => updateMapTileLayer('google-streets')}
            style={{
              padding: '5px 9px',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: mapLayer === 'google-streets' ? '#0f172a' : 'transparent',
              color: mapLayer === 'google-streets' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🗺️ Google Roads
          </button>

          <button
            type="button"
            onClick={() => updateMapTileLayer('google-satellite')}
            style={{
              padding: '5px 9px',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: mapLayer === 'google-satellite' ? '#0f172a' : 'transparent',
              color: mapLayer === 'google-satellite' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🛰️ Satellite
          </button>

          <button
            type="button"
            onClick={() => updateMapTileLayer('carto-light')}
            style={{
              padding: '5px 9px',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: mapLayer === 'carto-light' ? '#0f172a' : 'transparent',
              color: mapLayer === 'carto-light' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🏙️ Clean UI
          </button>
        </div>

        {/* Floating Quick Action Buttons (Top Left) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <button
            type="button"
            onClick={handleCenterRider}
            title="Recenter on Delivery Rider"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.76rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <LocateFixed size={13} color="#2563eb" /> Center Rider
          </button>

          <button
            type="button"
            onClick={handleFitEntireRoute}
            title="Fit Full Store-to-Doorstep Route"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.76rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Eye size={13} color="#059669" /> View Whole Route
          </button>
        </div>

        {/* Floating Real-time Radar Indicator (Bottom Left) */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'pulseGlow 1.5s infinite',
            }}
          />
          Live Google Maps GPS Active
        </div>
      </div>

      {/* 3. TIP RIDER ACKNOWLEDGMENT TOAST */}
      {tipMessage && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            padding: '8px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderBottom: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} color="#059669" />
          {tipMessage}
        </div>
      )}

      {/* 4. SWIGGY / ZOMATO STYLE DELIVERY PARTNER & SAFETY CARD */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Partner Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                border: '2px solid #2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                fontWeight: 900,
                fontSize: '1.1rem',
                position: 'relative',
              }}
            >
              <Bike size={24} />
              <span
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '2px solid #ffffff',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  {order.deliveryPersonnel || 'Sunil Verma'}
                </h4>
                <span
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  ⭐ 4.9
                </span>
                <span
                  style={{
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  Verified Partner
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Hero Splendor (MP-17-AB-4021) • 420+ safe deliveries in Rewa
              </p>
            </div>
          </div>

          {/* Quick Actions: Call & Tip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="tel:9826112233"
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
              }}
            >
              <Phone size={14} color="#34d399" /> Call Sunil (Masked)
            </a>

            {/* Tip Buttons (Swiggy/Zomato Style) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '2px' }}>
                Tip:
              </span>
              {[20, 30, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleTipRider(amt)}
                  style={{
                    backgroundColor: selectedTip === amt ? '#ecfdf5' : '#f8fafc',
                    color: selectedTip === amt ? '#059669' : '#334155',
                    border: selectedTip === amt ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '5px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safety & Hygiene Assurance Banner */}
        <div
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            color: '#475569',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>
              <strong>Zomato & Swiggy Safety Assured:</strong> Sanitized vehicle, helmet verified & temperature logged (98.4°F)
            </span>
          </div>

          <span style={{ color: '#2563eb', fontWeight: 600 }}>
            Delivery drop: {order.deliveryAddress.split(',')[0]}
          </span>
        </div>
      </div>

      {/* 5. INTERACTIVE LIVE ROUTE SIMULATION CONTROLS (For User / QA Testing) */}
      {showControls && (
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: '#f1f5f9',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
              🎮 Live Google Tracking Simulator:
            </span>
            <button
              type="button"
              onClick={() => setAutoSimulate(!autoSimulate)}
              style={{
                backgroundColor: autoSimulate ? '#10b981' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: autoSimulate ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
              }}
            >
              {autoSimulate ? <Pause size={13} /> : <Play size={13} />}
              {autoSimulate ? 'Pause Scooter' : 'Drive Along Streets'}
            </button>

            <button
              type="button"
              onClick={handleSimulateStep}
              disabled={simulating}
              style={{
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RotateCw size={13} className={simulating ? 'animate-spin' : ''} />
              Step Next Turn
            </button>
          </div>

          {/* Speed Multiplier & Follow Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Speed:</span>
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSimSpeed(spd)}
                  style={{
                    backgroundColor: simSpeed === spd ? '#2563eb' : '#ffffff',
                    color: simSpeed === spd ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 7px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAutoFollow(!autoFollow)}
              style={{
                backgroundColor: autoFollow ? '#eff6ff' : '#ffffff',
                color: autoFollow ? '#1d4ed8' : '#64748b',
                border: autoFollow ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {autoFollow ? '● Camera Lock: ON' : '○ Camera Lock: OFF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
