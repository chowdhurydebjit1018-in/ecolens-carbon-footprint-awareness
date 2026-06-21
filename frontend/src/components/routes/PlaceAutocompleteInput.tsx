import React, { useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { RouteLocation } from "../../api/routes.api";

interface PlaceAutocompleteInputProps {
  label: string;
  placeholder: string;
  iconColorClass: string;
  onLocationSelect: (location: RouteLocation | null) => void;
  value: RouteLocation | null;
}

export default function PlaceAutocompleteInput({
  label,
  placeholder,
  iconColorClass,
  onLocationSelect,
  value
}: PlaceAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value?.address || "");
  const [isTyping, setIsTyping] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const address = place.formatted_address || place.name || inputValue;
        setInputValue(address);
        setIsTyping(false);
        onLocationSelect({
          address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          placeId: place.place_id
        });
      } else {
        // Place selected but no geometry
        onLocationSelect(null);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsTyping(true);
    onLocationSelect(null); // invalidate until a proper place is selected
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        <MapPin className={`h-4 w-4 ${iconColorClass}`} /> {label}
      </label>
      <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
        <input
          type="text"
          required
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
        />
      </Autocomplete>
      {isTyping && inputValue.length > 0 && (
        <p className="text-[10px] text-amber-600 mt-1">Please choose a location from suggestions for accurate routing.</p>
      )}
    </div>
  );
}
