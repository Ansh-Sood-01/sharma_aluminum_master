import { describe, expect, it } from "vitest";
import { business, getAddressSearchUrl, getDirectionsUrl } from "@/config/business";

describe("central business configuration", () => {
  it("contains the supplied business contact details", () => {
    expect(business.name).toBe("Sharma Aluminium Master");
    expect(business.email).toBe("sharmaaluminium.1970@gmail.com");
    expect(business.contacts.map(({ name }) => name)).toEqual([
      "Raj Kumar",
      "Rohit",
      "Mohit",
    ]);
  });

  it("uses an address search when no verified place URL is configured", () => {
    const url = new URL(getAddressSearchUrl("", "Market Road, Jalandhar"));
    expect(url.hostname).toBe("www.google.com");
    expect(url.pathname).toBe("/maps/search/");
    expect(url.searchParams.get("query")).toContain("Market Road, Jalandhar");
  });

  it("prefers a configured verified place URL", () => {
    expect(getAddressSearchUrl("https://maps.google.com/?q=verified-shop-pin")).toBe(
      "https://maps.google.com/?q=verified-shop-pin",
    );
  });

  it("provides a useful directions URL without fabricating coordinates", () => {
    const url = new URL(getDirectionsUrl("", "Bharat Nagar Market, Jalandhar"));
    expect(url.hostname).toBe("www.google.com");
    expect(url.pathname).toBe("/maps/dir/");
    expect(url.searchParams.get("destination")).toContain("Bharat Nagar Market, Jalandhar");
    expect(url.searchParams.get("destination")).not.toContain("@31.");
  });
});
