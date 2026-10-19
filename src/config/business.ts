/**
 * Central, verified business details for Sharma Aluminium Master.
 * Keep unverified details (such as exact map coordinates and opening hours)
 * unset rather than inventing them.
 */
export const business = {
  name: "Sharma Aluminium Master",
  address:
    "Bharat Nagar Market, Bashirpura to Chaggitti Road, Jalandhar City, Punjab, India",
  email: "sharmaaluminium.1970@gmail.com",
  contacts: [
    {
      id: "raj-kumar",
      name: "Raj Kumar",
      displayPhone: "99882-57900",
      phoneE164: "+919988257900",
    },
    {
      id: "rohit",
      name: "Rohit",
      displayPhone: "89680-93533",
      phoneE164: "+918968093533",
    },
    {
      id: "mohit",
      name: "Mohit",
      displayPhone: "94657-63088",
      phoneE164: "+919465763088",
    },
  ],
  // Populate only after verifying the correct shop pin or Google Maps place.
  googleMapsPlaceUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_URL || "",
  // Optional public embed URL. Keep empty until a correct map is configured.
  googleMapsEmbedUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL || "",
} as const;

/**
 * Returns a verified Google Maps place URL when configured, otherwise a
 * useful address-search URL. This fallback does not claim exact coordinates.
 */
export function getAddressSearchUrl(
  configuredPlaceUrl: string = business.googleMapsPlaceUrl,
  address: string = business.address,
): string {
  const verifiedUrl = configuredPlaceUrl.trim();
  if (verifiedUrl) return verifiedUrl;

  const query = `${business.name}, ${address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Build a Google Maps directions URL without assuming a verified pin. */
export function getDirectionsUrl(
  configuredPlaceUrl: string = business.googleMapsPlaceUrl,
  address: string = business.address,
): string {
  const destination = configuredPlaceUrl.trim() || `${business.name}, ${address}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
