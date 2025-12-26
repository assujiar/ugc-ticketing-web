// ============================================
// VOLUME CALCULATIONS (CBM - Cubic Meters)
// Used for RFQ form auto-calculations
// ============================================

/**
 * Calculate volume per unit in CBM (Cubic Meters)
 * @param lengthCm Length in centimeters
 * @param widthCm Width in centimeters
 * @param heightCm Height in centimeters
 * @returns Volume in CBM
 */
export function calculateVolumePerUnit(
  lengthCm: number,
  widthCm: number,
  heightCm: number
): number {
  // Convert cm to m and calculate volume
  const lengthM = lengthCm / 100;
  const widthM = widthCm / 100;
  const heightM = heightCm / 100;

  const volume = lengthM * widthM * heightM;
  
  // Round to 6 decimal places
  return Math.round(volume * 1000000) / 1000000;
}

/**
 * Calculate total volume for all units
 * @param volumePerUnit Volume per unit in CBM
 * @param quantity Number of units
 * @returns Total volume in CBM
 */
export function calculateTotalVolume(volumePerUnit: number, quantity: number): number {
  const total = volumePerUnit * quantity;
  return Math.round(total * 1000000) / 1000000;
}

/**
 * Calculate both volume per unit and total volume
 * @param lengthCm Length in centimeters
 * @param widthCm Width in centimeters
 * @param heightCm Height in centimeters
 * @param quantity Number of units
 * @returns Object with volumePerUnit and totalVolume
 */
export function calculateVolumes(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  quantity: number
): { volumePerUnit: number; totalVolume: number } {
  const volumePerUnit = calculateVolumePerUnit(lengthCm, widthCm, heightCm);
  const totalVolume = calculateTotalVolume(volumePerUnit, quantity);

  return { volumePerUnit, totalVolume };
}

// ============================================
// WEIGHT CALCULATIONS
// ============================================

/**
 * Calculate total weight
 * @param weightPerUnit Weight per unit in kg
 * @param quantity Number of units
 * @returns Total weight in kg
 */
export function calculateTotalWeight(weightPerUnit: number, quantity: number): number {
  return Math.round(weightPerUnit * quantity * 100) / 100;
}

/**
 * Calculate chargeable weight (max of actual weight and volumetric weight)
 * Volumetric weight factor: 1 CBM = 167 kg (air freight standard)
 */
export function calculateChargeableWeight(
  actualWeightKg: number,
  volumeCbm: number,
  volumetricFactor: number = 167
): number {
  const volumetricWeight = volumeCbm * volumetricFactor;
  return Math.max(actualWeightKg, volumetricWeight);
}

// ============================================
// SLA CALCULATIONS
// ============================================

/**
 * Calculate hours elapsed between two dates
 */
export function calculateHoursElapsed(startDate: Date, endDate: Date = new Date()): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
}

/**
 * Check if SLA is met
 */
export function isSLAMet(hoursElapsed: number, slaHours: number): boolean {
  return hoursElapsed <= slaHours;
}

/**
 * Calculate SLA percentage remaining
 */
export function calculateSLAPercentageRemaining(
  hoursElapsed: number,
  slaHours: number
): number {
  if (slaHours <= 0) return 0;
  const percentageUsed = (hoursElapsed / slaHours) * 100;
  const percentageRemaining = 100 - percentageUsed;
  return Math.max(0, Math.round(percentageRemaining * 100) / 100);
}

/**
 * Get SLA status
 */
export type SLAStatus = "on_track" | "warning" | "at_risk" | "breached";

export function getSLAStatus(hoursElapsed: number, slaHours: number): SLAStatus {
  const percentageUsed = (hoursElapsed / slaHours) * 100;

  if (percentageUsed > 100) return "breached";
  if (percentageUsed > 90) return "at_risk";
  if (percentageUsed > 75) return "warning";
  return "on_track";
}

/**
 * Format hours as human readable string
 */
export function formatHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) {
    return `${days}d`;
  }
  return `${days}d ${remainingHours}h`;
}

/**
 * Calculate time remaining until SLA breach
 */
export function calculateTimeRemaining(
  startDate: Date,
  slaHours: number,
  currentDate: Date = new Date()
): { hours: number; formatted: string; status: SLAStatus } {
  const hoursElapsed = calculateHoursElapsed(startDate, currentDate);
  const hoursRemaining = slaHours - hoursElapsed;
  const status = getSLAStatus(hoursElapsed, slaHours);

  return {
    hours: Math.round(hoursRemaining * 100) / 100,
    formatted: hoursRemaining > 0 ? formatHours(hoursRemaining) : "Breached",
    status,
  };
}

// ============================================
// METRICS CALCULATIONS
// ============================================

/**
 * Calculate compliance percentage
 */
export function calculateCompliance(met: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((met / total) * 100 * 100) / 100;
}

/**
 * Calculate average
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

/**
 * Calculate percentile (e.g., p50, p95, p99)
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)] ?? 0;
}

// ============================================
// CURRENCY FORMATTING
// ============================================

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ============================================
// PERCENTAGE FORMATTING
// ============================================

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}