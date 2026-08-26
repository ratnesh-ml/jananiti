import { describe, expect, it } from "vitest";
import { mappableCivicRecords } from "./CivicMap";

describe("free civic map marker eligibility", () => {
  it("renders markers only for records with an explicit finite coordinate pair", () => {
    const records = [
      { id: "mapped", title: "Mapped", locality: "Ward 1", latitude: 28.6139, longitude: 77.209 },
      { id: "locality-only", title: "Locality only", locality: "Ward 2", latitude: null, longitude: null },
      { id: "invalid", title: "Invalid", locality: "Ward 3", latitude: Number.NaN, longitude: 72.8 },
    ];

    expect(mappableCivicRecords(records).map((record) => record.id)).toEqual(["mapped"]);
  });
});
