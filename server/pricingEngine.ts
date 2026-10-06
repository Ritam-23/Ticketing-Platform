import { EventItem, SeatingTier } from '../src/types.js';

export interface CalculatedTierPrice {
  tierId: string;
  tierName: string;
  basePrice: number;
  finalPrice: number;
  surgeMultiplier: number;
  isSurging: boolean;
  reasons: string[];
}

export function calculateTierPrice(
  event: EventItem,
  tier: SeatingTier
): CalculatedTierPrice {
  const policy = event.dynamicPricingPolicy;
  if (!policy || !policy.enabled) {
    return {
      tierId: tier.id,
      tierName: tier.name,
      basePrice: tier.basePrice,
      finalPrice: tier.basePrice,
      surgeMultiplier: 1.0,
      isSurging: false,
      reasons: ['Base pricing active (dynamic policy disabled)'],
    };
  }

  let totalMultiplier = 1.0;
  const reasons: string[] = [];

  // 1. Scarcity / Inventory depletion rule
  const tierCapacity = tier.totalCapacity || 20;
  const tierSoldCount = tier.soldCount || 0;
  const soldPct = (tierSoldCount / tierCapacity) * 100;

  if (soldPct >= policy.scarcityThresholdPct) {
    const scarcityLift = policy.scarcityMultiplier - 1.0;
    // Scale extra if it's over 90%
    const extraOverThreshold = Math.max(0, (soldPct - policy.scarcityThresholdPct) / 30);
    const effectiveScarcityLift = scarcityLift * (1 + extraOverThreshold);
    totalMultiplier += effectiveScarcityLift;
    reasons.push(`High demand scarcity: ${soldPct.toFixed(0)}% sold (Threshold: ${policy.scarcityThresholdPct}%)`);
  }

  // 2. Booking Velocity Surge
  if (event.recentBookingVelocity >= policy.highDemandVelocityThreshold) {
    const velocityLift = policy.velocityMultiplier - 1.0;
    totalMultiplier += velocityLift;
    reasons.push(`High velocity: ${event.recentBookingVelocity} bookings/5min`);
  }

  // 3. Time Decay / Urgency
  if (policy.timeDecayEnabled && event.date) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 30 && policy.earlyBirdDiscountPct > 0) {
      const discount = policy.earlyBirdDiscountPct / 100;
      totalMultiplier -= discount;
      reasons.push(`Early Bird discount: -${policy.earlyBirdDiscountPct}% (${diffDays} days away)`);
    } else if (diffDays <= 3 && policy.lastMinuteSurgePct > 0) {
      const rushSurge = policy.lastMinuteSurgePct / 100;
      totalMultiplier += rushSurge;
      reasons.push(`Rush demand surge: +${policy.lastMinuteSurgePct}% (${diffDays} days left)`);
    }
  }

  // Apply multiplier to base price
  let rawPrice = tier.basePrice * totalMultiplier;

  // Enforce Bounds (Price Floor & Ceiling)
  if (policy.minPriceFloor && rawPrice < policy.minPriceFloor) {
    rawPrice = policy.minPriceFloor;
    reasons.push(`Protected by min price floor (₹${policy.minPriceFloor})`);
  }
  if (policy.maxPriceCeiling && rawPrice > policy.maxPriceCeiling) {
    rawPrice = policy.maxPriceCeiling;
    reasons.push(`Capped at max price ceiling (₹${policy.maxPriceCeiling})`);
  }

  const roundedFinalPrice = Math.round(rawPrice);
  const effectiveMultiplier = Number((roundedFinalPrice / tier.basePrice).toFixed(2));

  return {
    tierId: tier.id,
    tierName: tier.name,
    basePrice: tier.basePrice,
    finalPrice: roundedFinalPrice,
    surgeMultiplier: effectiveMultiplier,
    isSurging: effectiveMultiplier > 1.05,
    reasons: reasons.length > 0 ? reasons : ['Normal base market rate'],
  };
}
