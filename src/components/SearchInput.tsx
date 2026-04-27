import React, { useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export interface SelectedDestination {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface Prediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

interface SearchInputProps {
  onPlaceSelect: (place: SelectedDestination) => void;
  currentLocation: GeolocationCoordinates | null;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ onPlaceSelect, currentLocation, placeholder = "Search destination..." }) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = async (input: string) => {
    if (!input.trim()) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const request: google.maps.places.AutocompleteRequest = { input };
      if (currentLocation) {
        request.locationBias = new google.maps.Circle({
          center: { lat: currentLocation.latitude, lng: currentLocation.longitude },
          radius: 50000,
        });
      }
      const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      const mapped: Prediction[] = suggestions
        .filter((s) => s.placePrediction)
        .map((s) => {
          const pred = s.placePrediction!;
          return {
            placeId: pred.placeId,
            mainText: pred.mainText?.text || '',
            secondaryText: pred.secondaryText?.text || '',
            description: pred.text?.text || '',
          };
        });
      setPredictions(mapped);
      setIsOpen(mapped.length > 0);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchPredictions(val), 300);
  };

  const handleSelectPrediction = async (pred: Prediction) => {
    setIsOpen(false);
    setQuery(pred.mainText);
    setPredictions([]);
    setLoading(true);
    try {
      const place = new google.maps.places.Place({ id: pred.placeId });
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
      if (place.location) {
        onPlaceSelect({
          name: place.displayName || pred.mainText,
          address: place.formattedAddress || pred.secondaryText,
          lat: place.location.lat(),
          lng: place.location.lng(),
        });
      }
    } catch (err) {
      console.error('Place details error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="glass" style={{
        display: 'flex', alignItems: 'center', height: 56, padding: '0 16px',
        borderRadius: 16, overflow: 'hidden', position: 'relative', zIndex: 20,
      }}>
        <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (predictions.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          style={{
            width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 16, marginLeft: 12,
            fontFamily: 'var(--font-body)', fontWeight: 400,
          }}
        />
        {loading && <Loader2 size={20} style={{ color: 'var(--accent)', flexShrink: 0, animation: 'spin 1s linear infinite' }} />}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="glass-strong" style={{
          position: 'absolute', top: 64, left: 0, right: 0, zIndex: 30,
          maxHeight: 300, overflowY: 'auto', borderRadius: 16, padding: '4px 0',
        }}>
          {predictions.map((p) => (
            <button
              key={p.placeId}
              onClick={() => handleSelectPrediction(p)}
              style={{
                display: 'flex', flexDirection: 'column', textAlign: 'left',
                width: '100%', padding: '14px 16px', background: 'transparent', border: 'none',
                borderBottom: '1px solid var(--border)', cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent-glow)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>
                {p.mainText}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {p.secondaryText}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
