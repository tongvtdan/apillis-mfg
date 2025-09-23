import { z } from 'zod';

// Cost categories and types
export type CostCategory = 'material' | 'labor' | 'overhead' | 'shipping' | 'taxes' | 'other';
export type CostType = 'fixed' | 'variable' | 'semi_variable';
export type MarginType = 'gross' | 'net' | 'contribution';
export type PricingStrategy = 'cost_plus' | 'market_based' | 'competition_based' | 'value_based';

// Cost item schema
export const costItemSchema = z.object({
    id: z.string().optional(),
    category: z.enum(['material', 'labor', 'overhead', 'shipping', 'taxes', 'other']),
    type: z.enum(['fixed', 'variable', 'semi_variable']),
    name: z.string().min(1, 'Cost item name is required'),
    description: z.string().optional(),
    unitCost: z.number().positive('Unit cost must be positive'),
    quantity: z.number().positive('Quantity must be positive'),
    totalCost: z.number().min(0),
    isRecurring: z.boolean(),
    frequency: z.enum(['one_time', 'per_unit', 'monthly', 'quarterly', 'yearly']).optional(),
    supplier: z.string().optional(),
    notes: z.string().optional()
});

// Volume pricing schema
export const volumePricingSchema = z.object({
    minQuantity: z.number().min(0),
    maxQuantity: z.number().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().min(0).max(100)
});

// Margin analysis schema
export const marginAnalysisSchema = z.object({
    targetMargin: z.number().min(0).max(100),
    actualMargin: z.number().min(0),
    breakEvenPoint: z.number().min(0),
    profitPerUnit: z.number(),
    roi: z.number().min(0),
    paybackPeriod: z.number().min(0)
});

// Costing scenario schema
export const costingScenarioSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Scenario name is required'),
    description: z.string().optional(),
    costItems: z.array(costItemSchema),
    volumePricing: z.array(volumePricingSchema).optional(),
    marginAnalysis: marginAnalysisSchema,
    totalCost: z.number().min(0),
    recommendedPrice: z.number().min(0),
    pricingStrategy: z.enum(['cost_plus', 'market_based', 'competition_based', 'value_based']),
    isActive: z.boolean(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

// Cost breakdown schema
export const costBreakdownSchema = z.object({
    materials: z.number().min(0),
    labor: z.number().min(0),
    overhead: z.number().min(0),
    shipping: z.number().min(0),
    taxes: z.number().min(0),
    other: z.number().min(0),
    total: z.number().min(0)
});

// Pricing recommendation schema
export const pricingRecommendationSchema = z.object({
    basePrice: z.number().min(0),
    targetMargin: z.number().min(0).max(100),
    recommendedPrice: z.number().min(0),
    minPrice: z.number().min(0),
    maxPrice: z.number().min(0),
    confidence: z.enum(['low', 'medium', 'high']),
    reasoning: z.string()
});

// Type inference
export type CostItem = z.infer<typeof costItemSchema>;
export type VolumePricing = z.infer<typeof volumePricingSchema>;
export type MarginAnalysis = z.infer<typeof marginAnalysisSchema>;
export type CostingScenario = z.infer<typeof costingScenarioSchema>;
export type CostBreakdown = z.infer<typeof costBreakdownSchema>;
export type PricingRecommendation = z.infer<typeof pricingRecommendationSchema>;

// Costing engine result
export interface CostingResult {
    scenario: CostingScenario;
    breakdown: CostBreakdown;
    recommendation: PricingRecommendation;
    risks: CostingRisk[];
    assumptions: string[];
}

// Costing risk assessment
export interface CostingRisk {
    category: 'material_volatility' | 'labor_costs' | 'market_competition' | 'demand_uncertainty' | 'regulatory_changes';
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
    impact: number; // Percentage impact on total cost
}

// Scenario comparison
export interface ScenarioComparison {
    scenarios: CostingScenario[];
    metrics: {
        costVariance: number;
        marginVariance: number;
        riskVariance: number;
    };
    recommendation: {
        bestScenario: string;
        reasoning: string;
        confidence: 'low' | 'medium' | 'high';
    };
}

// Costing engine configuration
export const COSTING_CONFIG = {
    categories: {
        material: { label: 'Materials', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        labor: { label: 'Labor', color: 'bg-green-100 text-green-800 border-green-200' },
        overhead: { label: 'Overhead', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        shipping: { label: 'Shipping', color: 'bg-orange-100 text-orange-800 border-orange-200' },
        taxes: { label: 'Taxes', color: 'bg-red-100 text-red-800 border-red-200' },
        other: { label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    },
    types: {
        fixed: { label: 'Fixed Cost', description: 'Does not change with volume' },
        variable: { label: 'Variable Cost', description: 'Changes with volume' },
        semi_variable: { label: 'Semi-Variable', description: 'Partially changes with volume' }
    },
    strategies: {
        cost_plus: { label: 'Cost Plus', description: 'Base price + margin' },
        market_based: { label: 'Market Based', description: 'Based on market rates' },
        competition_based: { label: 'Competition Based', description: 'Match competitor pricing' },
        value_based: { label: 'Value Based', description: 'Based on perceived value' }
    },
    defaultMargins: {
        low: 15,
        medium: 25,
        high: 35,
        premium: 50
    }
} as const;

// Cost calculation utilities
export class CostCalculations {

    /**
     * Calculate total cost from cost items
     */
    static calculateTotalCost(costItems: CostItem[], quantity: number = 1): number {
        return costItems.reduce((total, item) => {
            let itemTotal = item.unitCost * item.quantity;

            // Apply volume-based adjustments
            if (item.type === 'variable') {
                itemTotal = itemTotal * quantity;
            } else if (item.type === 'semi_variable') {
                // Semi-variable costs scale partially with volume
                const scalingFactor = Math.min(quantity / 100, 1); // Cap at 100 units
                itemTotal = item.unitCost * item.quantity * (0.5 + 0.5 * scalingFactor);
            }
            // Fixed costs remain constant

            return total + itemTotal;
        }, 0);
    }

    /**
     * Calculate cost breakdown by category
     */
    static calculateCostBreakdown(costItems: CostItem[], quantity: number = 1): CostBreakdown {
        const breakdown = {
            materials: 0,
            labor: 0,
            overhead: 0,
            shipping: 0,
            taxes: 0,
            other: 0,
            total: 0
        };

        costItems.forEach(item => {
            let itemTotal = this.calculateItemCost(item, quantity);
            breakdown.total += itemTotal;

            switch (item.category) {
                case 'material':
                    breakdown.materials += itemTotal;
                    break;
                case 'labor':
                    breakdown.labor += itemTotal;
                    break;
                case 'overhead':
                    breakdown.overhead += itemTotal;
                    break;
                case 'shipping':
                    breakdown.shipping += itemTotal;
                    break;
                case 'taxes':
                    breakdown.taxes += itemTotal;
                    break;
                case 'other':
                    breakdown.other += itemTotal;
                    break;
            }
        });

        return breakdown;
    }

    /**
     * Calculate individual cost item cost
     */
    static calculateItemCost(item: CostItem, quantity: number = 1): number {
        let baseCost = item.unitCost * item.quantity;

        switch (item.type) {
            case 'fixed':
                return baseCost;
            case 'variable':
                return baseCost * quantity;
            case 'semi_variable':
                // Scale between 50% and 100% based on volume
                const scalingFactor = Math.min(quantity / 1000, 1);
                return baseCost * (0.5 + 0.5 * scalingFactor);
            default:
                return baseCost;
        }
    }

    /**
     * Calculate margin analysis
     */
    static calculateMarginAnalysis(
        totalCost: number,
        targetMargin: number,
        quantity: number = 1
    ): MarginAnalysis {
        const costPerUnit = totalCost / quantity;
        const targetPrice = costPerUnit * (1 + targetMargin / 100);
        const profitPerUnit = targetPrice - costPerUnit;

        // Simple break-even calculation (assuming linear cost structure)
        const breakEvenPoint = totalCost / (targetPrice - costPerUnit);

        // ROI calculation (simplified)
        const roi = (profitPerUnit * quantity) / totalCost * 100;

        // Payback period (simplified - assuming even cash flow)
        const paybackPeriod = totalCost / (profitPerUnit * quantity);

        return {
            targetMargin,
            actualMargin: targetMargin,
            breakEvenPoint: Math.max(1, breakEvenPoint),
            profitPerUnit,
            roi,
            paybackPeriod
        };
    }

    /**
     * Generate pricing recommendation
     */
    static generatePricingRecommendation(
        totalCost: number,
        quantity: number,
        marketData?: { minPrice: number; maxPrice: number; avgPrice: number }
    ): PricingRecommendation {
        const costPerUnit = totalCost / quantity;
        const basePrice = costPerUnit;

        // Default margin targets
        const marginTargets = [20, 30, 40]; // 20%, 30%, 40%
        const prices = marginTargets.map(margin => costPerUnit * (1 + margin / 100));

        let recommendedPrice = prices[1]; // Default to 30% margin
        let confidence: 'low' | 'medium' | 'high' = 'medium';
        let reasoning = 'Standard margin applied based on cost analysis.';

        // Adjust based on market data if available
        if (marketData) {
            const marketAvg = marketData.avgPrice;
            const marketMin = marketData.minPrice;
            const marketMax = marketData.maxPrice;

            // If our cost-based price is within market range
            if (recommendedPrice >= marketMin && recommendedPrice <= marketMax) {
                confidence = 'high';
                reasoning = `Price aligns with market range ($${marketMin.toFixed(2)} - $${marketMax.toFixed(2)}).`;
            } else if (recommendedPrice > marketMax) {
                // Our price is too high
                recommendedPrice = marketMax * 0.95; // 5% below market max
                confidence = 'low';
                reasoning = `Adjusted below market maximum to remain competitive. Market range: $${marketMin.toFixed(2)} - $${marketMax.toFixed(2)}.`;
            } else {
                // Our price is below market minimum
                recommendedPrice = Math.max(recommendedPrice, marketMin * 1.05); // 5% above market min
                confidence = 'medium';
                reasoning = `Price adjusted to meet market minimum threshold. Market range: $${marketMin.toFixed(2)} - $${marketMax.toFixed(2)}.`;
            }
        }

        const minPrice = costPerUnit * 1.05; // Minimum 5% margin
        const maxPrice = costPerUnit * 2.0; // Maximum 100% margin

        return {
            basePrice: costPerUnit,
            targetMargin: ((recommendedPrice / costPerUnit) - 1) * 100,
            recommendedPrice,
            minPrice,
            maxPrice,
            confidence,
            reasoning
        };
    }
}
