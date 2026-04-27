import { NavStep, ManeuverType } from '../types/navigation';

export function parseSteps(googleSteps: google.maps.DirectionsStep[]): NavStep[] {
  const parser = new DOMParser();

  return googleSteps.map((step) => {
    // Strip HTML from instruction
    const doc = parser.parseFromString(step.instructions, 'text/html');
    const instruction = doc.body.textContent || '';

    // Maneuver string mapping
    let maneuver: ManeuverType = 'straight';
    if (step.maneuver) {
      // Map google maneuver string to our types if possible, else default to straight
      const validManeuvers: ManeuverType[] = [
        'turn-left', 'turn-right', 'turn-sharp-left', 'turn-sharp-right',
        'turn-slight-left', 'turn-slight-right', 'straight', 'keep-left',
        'keep-right', 'uturn-left', 'uturn-right', 'roundabout-left',
        'roundabout-right', 'merge', 'fork-left', 'fork-right',
        'ramp-left', 'ramp-right'
      ];
      if (validManeuvers.includes(step.maneuver as ManeuverType)) {
        maneuver = step.maneuver as ManeuverType;
      }
    }

    return {
      instruction,
      rawInstruction: step.instructions,
      maneuver,
      distanceText: step.distance?.text || '0 m',
      distanceValue: step.distance?.value || 0,
      durationText: step.duration?.text || '0 mins',
      endLocation: step.end_location,
      polyline: step.path,
    };
  });
}
