export type ManeuverType = 
  | 'turn-left' | 'turn-right'
  | 'turn-sharp-left' | 'turn-sharp-right'
  | 'turn-slight-left' | 'turn-slight-right'
  | 'straight' | 'keep-left' | 'keep-right'
  | 'uturn-left' | 'uturn-right'
  | 'roundabout-left' | 'roundabout-right'
  | 'merge' | 'fork-left' | 'fork-right'
  | 'ramp-left' | 'ramp-right';

export interface NavStep {
  instruction: string;       // stripped HTML
  rawInstruction: string;    // original HTML
  maneuver: ManeuverType;
  distanceText: string;
  distanceValue: number;     // meters
  durationText: string;
  endLocation: google.maps.LatLng;
  polyline: google.maps.LatLng[];
}

export interface RouteState {
  steps: NavStep[];
  totalDistanceText: string;
  totalDurationText: string;
  eta: string;
}
