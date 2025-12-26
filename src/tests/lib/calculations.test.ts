import {
  calculateVolumes,
  calculateChargeableWeight,
  calculateTotalWeight,
  cbmToLiters,
  litersToCBM,
  kgToLbs,
  lbsToKg,
} from "@/lib/calculations";

describe("calculateVolumes", () => {
  it("should calculate volume per unit in CBM", () => {
    // 100cm x 100cm x 100cm = 1 CBM
    const result = calculateVolumes(100, 100, 100, 1);
    expect(result.volumePerUnit).toBe(1);
    expect(result.totalVolume).toBe(1);
  });

  it("should calculate total volume with quantity", () => {
    const result = calculateVolumes(100, 100, 100, 5);
    expect(result.volumePerUnit).toBe(1);
    expect(result.totalVolume).toBe(5);
  });

  it("should handle small dimensions", () => {
    // 50cm x 40cm x 30cm = 0.06 CBM
    const result = calculateVolumes(50, 40, 30, 1);
    expect(result.volumePerUnit).toBeCloseTo(0.06, 5);
  });

  it("should handle decimal dimensions", () => {
    const result = calculateVolumes(33.5, 22.3, 15.7, 2);
    expect(result.volumePerUnit).toBeGreaterThan(0);
    expect(result.totalVolume).toBeCloseTo(result.volumePerUnit * 2, 5);
  });

  it("should return 0 for zero dimensions", () => {
    const result = calculateVolumes(0, 100, 100, 1);
    expect(result.volumePerUnit).toBe(0);
    expect(result.totalVolume).toBe(0);
  });
});

describe("calculateChargeableWeight", () => {
  it("should return actual weight when heavier", () => {
    // Actual weight: 100kg, Volumetric: 50kg
    const result = calculateChargeableWeight(100, 0.3); // 0.3 CBM * 167 = ~50kg
    expect(result.chargeableWeight).toBe(100);
    expect(result.basis).toBe("actual");
  });

  it("should return volumetric weight when heavier", () => {
    // Actual weight: 10kg, Volumetric: ~167kg (1 CBM)
    const result = calculateChargeableWeight(10, 1);
    expect(result.chargeableWeight).toBe(167);
    expect(result.basis).toBe("volumetric");
  });

  it("should use custom dim factor", () => {
    const result = calculateChargeableWeight(10, 1, 200);
    expect(result.chargeableWeight).toBe(200);
    expect(result.volumetricWeight).toBe(200);
  });

  it("should handle equal weights", () => {
    // When volumetric equals actual, default to actual
    const result = calculateChargeableWeight(167, 1);
    expect(result.basis).toBe("volumetric"); // 167 == 167, returns volumetric if equal
  });
});

describe("calculateTotalWeight", () => {
  it("should calculate total weight", () => {
    expect(calculateTotalWeight(10, 5)).toBe(50);
    expect(calculateTotalWeight(2.5, 4)).toBe(10);
  });

  it("should handle zero quantity", () => {
    expect(calculateTotalWeight(10, 0)).toBe(0);
  });

  it("should handle decimal weights", () => {
    expect(calculateTotalWeight(1.5, 3)).toBeCloseTo(4.5, 5);
  });
});

describe("cbmToLiters", () => {
  it("should convert CBM to liters", () => {
    expect(cbmToLiters(1)).toBe(1000);
    expect(cbmToLiters(0.5)).toBe(500);
    expect(cbmToLiters(2.5)).toBe(2500);
  });

  it("should handle zero", () => {
    expect(cbmToLiters(0)).toBe(0);
  });
});

describe("litersToCBM", () => {
  it("should convert liters to CBM", () => {
    expect(litersToCBM(1000)).toBe(1);
    expect(litersToCBM(500)).toBe(0.5);
    expect(litersToCBM(2500)).toBe(2.5);
  });

  it("should handle zero", () => {
    expect(litersToCBM(0)).toBe(0);
  });
});

describe("kgToLbs", () => {
  it("should convert kg to lbs", () => {
    expect(kgToLbs(1)).toBeCloseTo(2.20462, 4);
    expect(kgToLbs(10)).toBeCloseTo(22.0462, 4);
  });

  it("should handle zero", () => {
    expect(kgToLbs(0)).toBe(0);
  });
});

describe("lbsToKg", () => {
  it("should convert lbs to kg", () => {
    expect(lbsToKg(1)).toBeCloseTo(0.453592, 4);
    expect(lbsToKg(10)).toBeCloseTo(4.53592, 4);
  });

  it("should handle zero", () => {
    expect(lbsToKg(0)).toBe(0);
  });
});