import { useState, useEffect, useRef } from 'react';
import { RouteState } from '../types/navigation';
import { parseSteps } from '../utils/parseSteps';
import { haversineDistance } from '../utils/distance';

export function useDirections(
  destination: google.maps.LatLng | null,
  currentLocation: GeolocationCoordinates | null,
  announce: (text: string) => void
) {
  const [routeState, setRouteState] = useState<RouteState | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [distanceToNext, setDistanceToNext] = useState<number | null>(null);
  const [routeLoaded, setRouteLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const directionsService = useRef<google.maps.DirectionsService | null>(null);

  // Initial route fetch
  useEffect(() => {
    if (!destination || !currentLocation || routeLoaded) return;

    if (!directionsService.current) {
      directionsService.current = new google.maps.DirectionsService();
    }

    const origin = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);

    directionsService.current.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.TWO_WHEELER, // Fallback to DRIVING if TWO_WHEELER not supported in region
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const leg = result.routes[0].legs[0];
          const steps = parseSteps(leg.steps);
          
          setRouteState({
            steps,
            totalDistanceText: leg.distance?.text || '',
            totalDurationText: leg.duration?.text || '',
            eta: calculateEta(leg.duration?.value || 0),
          });
          
          setRouteLoaded(true);
          setCurrentStepIndex(0);
          setDistanceToNext(steps[0]?.distanceValue || null);
          announce(`Navigating to your destination. ${steps[0]?.instruction}`);
        } else if (status === 'ZERO_RESULTS') {
            // Try driving mode if two wheeler fails
            directionsService.current?.route(
                {
                    origin,
                    destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (resultDriving, statusDriving) => {
                    if (statusDriving === google.maps.DirectionsStatus.OK && resultDriving) {
                        const leg = resultDriving.routes[0].legs[0];
                        const steps = parseSteps(leg.steps);
                        
                        setRouteState({
                          steps,
                          totalDistanceText: leg.distance?.text || '',
                          totalDurationText: leg.duration?.text || '',
                          eta: calculateEta(leg.duration?.value || 0),
                        });
                        
                        setRouteLoaded(true);
                        setCurrentStepIndex(0);
                        setDistanceToNext(steps[0]?.distanceValue || null);
                        announce(`Navigating to your destination. ${steps[0]?.instruction}`);
                    } else {
                        setError(`Could not find a route: ${statusDriving}`);
                    }
                }
            );
        } else {
          setError(`Could not find a route: ${status}`);
        }
      }
    );
  }, [destination, currentLocation, routeLoaded, announce]);

  // Track progress with jitter filtering
  const lastDistRef = useRef<number | null>(null);

  useEffect(() => {
    if (!routeState || !currentLocation || currentStepIndex >= routeState.steps.length) return;

    const currentPos = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
    const currentStep = routeState.steps[currentStepIndex];
    
    let dist = 0;
    if (google.maps.geometry && google.maps.geometry.spherical) {
        dist = google.maps.geometry.spherical.computeDistanceBetween(currentPos, currentStep.endLocation);
    } else {
        dist = haversineDistance(currentPos, currentStep.endLocation);
    }

    const rounded = Math.round(dist);

    // Jitter filter: only update if distance changed by more than 5m
    if (lastDistRef.current !== null && Math.abs(rounded - lastDistRef.current) < 5) {
      return; // Skip tiny GPS fluctuations
    }
    lastDistRef.current = rounded;
    setDistanceToNext(rounded);

    // Announce upcoming turn
    if (dist <= 300 && dist > 270) {
        announce(`In 300 meters, ${currentStep.instruction}`);
    } else if (dist <= 100 && dist > 70) {
        announce(`In 100 meters, ${currentStep.instruction}`);
    }

    // Advance step if within 30 meters of the step's end location
    if (dist < 30) {
      if (currentStepIndex < routeState.steps.length - 1) {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        lastDistRef.current = null; // Reset on step change
        announce(routeState.steps[nextIdx].instruction);
      } else {
        announce("You have arrived at your destination.");
      }
    }
  }, [currentLocation, routeState, currentStepIndex, announce]);

  // Determine road type from current step instruction
  const currentInstruction = routeState?.steps[currentStepIndex]?.instruction?.toLowerCase() || '';
  const roadType: 'highway' | 'standard' = 
    /\b(nh|nh-|national highway|expressway|freeway|motorway|bypass)\b/i.test(currentInstruction)
      ? 'highway' : 'standard';

  return {
    currentStep: routeState?.steps[currentStepIndex] || null,
    nextStep: routeState?.steps[currentStepIndex + 1] || null,
    distanceToNext,
    eta: routeState?.eta || '--:--',
    totalDistance: routeState?.totalDistanceText || '-- km',
    routeLoaded,
    error,
    roadType,
  };
}

function calculateEta(durationSeconds: number): string {
  const date = new Date(Date.now() + durationSeconds * 1000);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
