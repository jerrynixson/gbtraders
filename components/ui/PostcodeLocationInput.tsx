import React, { useState, useEffect } from 'react';

export interface LocationInfo {
  addressLines: [string, string, string, string]; // 4th element for postcode
  lat: number;
  long: number;
}

interface PostcodeLocationInputProps {
  value: LocationInfo;
  onChange: (location: LocationInfo) => void;
  onValidationChange?: (isValid: boolean) => void;
  label?: string;
  required?: boolean;
}

const ukPostcodeRegex = /^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2}))$/;

export const PostcodeLocationInput: React.FC<PostcodeLocationInputProps> = ({ value, onChange, onValidationChange, label = 'Postcode', required = false }) => {
  const [postcode, setPostcode] = useState(value.addressLines[3] || '');
  const [isValid, setIsValid] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasCoordinates, setHasCoordinates] = useState(false);

  useEffect(() => {
    setPostcode(value.addressLines[3] || '');
  }, [value.addressLines]);

  useEffect(() => {
    // Call validation change callback when validation state changes
    // Consider valid when postcode format is correct AND coordinates are available
    const isFullyValid = isValid && hasCoordinates;
    if (onValidationChange) {
      onValidationChange(isFullyValid);
    }
  }, [isValid, hasCoordinates, onValidationChange]);

  const validatePostcode = (postcode: string): boolean => {
    return postcode.trim() !== '' && ukPostcodeRegex.test(postcode.trim());
  };

  const getCoordinatesFromPostcode = async (postcode: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error('Google Maps API key not configured');
    const searchQuery = `${postcode} UK`;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}&region=uk&components=country:GB`
    );
    if (!response.ok) throw new Error('Failed to fetch coordinates');
    const data = await response.json();
    if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) throw new Error('No coordinates found for this postcode');
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  };

  const handlePostcodeChange = async (inputValue: string) => {
    let processedValue = inputValue.toUpperCase().replace(/\s+/g, '');
    if (processedValue.length > 3) {
      processedValue = processedValue.slice(0, -3) + ' ' + processedValue.slice(-3);
    }
    setPostcode(processedValue);
    const isValid = validatePostcode(processedValue);
    setIsValid(isValid);
    // Update addressLines with new postcode, keep other fields unchanged
    onChange({
      addressLines: [value.addressLines[0], value.addressLines[1], value.addressLines[2], processedValue],
      lat: value.lat,
      long: value.long,
    });
    if (isValid) {
      setIsFetching(true);
      setHasCoordinates(false);
      try {
        const coordinates = await getCoordinatesFromPostcode(processedValue);
        onChange({
          addressLines: [value.addressLines[0], value.addressLines[1], value.addressLines[2], processedValue],
          lat: coordinates.latitude,
          long: coordinates.longitude,
        });
        setHasCoordinates(true);
      } catch (error) {
        setHasCoordinates(false);
      } finally {
        setIsFetching(false);
      }
    } else {
      setHasCoordinates(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
      <input
        type="text"
        value={postcode}
        onChange={e => handlePostcodeChange(e.target.value)}
        placeholder="e.g., SW1A 1AA"
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isValid && postcode ? 'border-red-500' : 'border-gray-200'}`}
        required={required}
        aria-invalid={!isValid}
      />
      {isFetching && <div className="text-blue-500 text-xs">Fetching coordinates...</div>}
      {!isValid && postcode && <div className="text-red-600 text-xs">Please enter a valid UK postcode</div>}
      {hasCoordinates && <div className="text-green-600 text-xs">✓ Location coordinates updated</div>}
    </div>
  );
};
