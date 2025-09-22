import { supabase } from '@/integrations/supabase/client.ts';
import { useAuth } from '@/core/auth';
import {
    CostItem,
    CostingScenario,
    CostingResult,
    CostingRisk,
    ScenarioComparison,
    CostCalculations,
    COSTING_CONFIG
} from '../types/costing-engine.types';

export class CostingEngineService {

    /**
     * Calculate costing scenario
     */
    static async calculateScenario(
        projectId: string,
        costItems: CostItem[],
        quantity: number = 1,
        targetMargin: number = 25,
        marketData?: { minPrice: number; maxPrice: number; avgPrice: number }
    ): Promise<CostingResult> {

        console.log('💰 Calculating costing scenario:', {
            projectId,
            itemCount: costItems.length,
            quantity,
            targetMargin
        });

        try {
            // Calculate total cost
            const totalCost = CostCalculations.calculateTotalCost(costItems, quantity);

            // Calculate cost breakdown
            const breakdown = CostCalculations.calculateCostBreakdown(costItems, quantity);

            // Calculate margin analysis
            const marginAnalysis = CostCalculations.calculateMarginAnalysis(
                totalCost,
                targetMargin,
                quantity
            );

            // Generate pricing recommendation
            const recommendation = CostCalculations.generatePricingRecommendation(
                totalCost,
                quantity,
                marketData
            );

            // Assess risks
            const risks = await this.assessCostingRisks(costItems, projectId);

            // Generate scenario
            const scenario: CostingScenario = {
                name: `Scenario ${new Date().toLocaleDateString()}`,
                description: `Cost analysis for ${quantity} units`,
                costItems,
                marginAnalysis,
                totalCost,
                recommendedPrice: recommendation.recommendedPrice,
                pricingStrategy: 'cost_plus',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Generate assumptions
            const assumptions = this.generateAssumptions(costItems, quantity);

            return {
                scenario,
                breakdown,
                recommendation,
                risks,
                assumptions
            };

        } catch (error) {
            console.error('❌ Costing calculation failed:', error);
            throw new Error(`Failed to calculate costing scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Save costing scenario
     */
    static async saveScenario(
        projectId: string,
        scenario: CostingScenario,
        userId: string
    ): Promise<string> {

        try {
            const scenarioData = {
                project_id: projectId,
                name: scenario.name,
                description: scenario.description,
                cost_items: scenario.costItems,
                volume_pricing: scenario.volumePricing || [],
                margin_analysis: scenario.marginAnalysis,
                total_cost: scenario.totalCost,
                recommended_price: scenario.recommendedPrice,
                pricing_strategy: scenario.pricingStrategy,
                is_active: scenario.isActive,
                created_by: userId,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('costing_scenarios')
                .insert(scenarioData)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to save scenario: ${error.message}`);
            }

            // Log activity
            await this.logCostingActivity(projectId, 'scenario_created', {
                scenarioId: data.id,
                scenarioName: scenario.name,
                totalCost: scenario.totalCost
            }, userId);

            return data.id;

        } catch (error) {
            console.error('❌ Failed to save scenario:', error);
            throw new Error(`Failed to save costing scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get costing scenarios for project
     */
    static async getProjectScenarios(projectId: string): Promise<CostingScenario[]> {

        try {
            const { data, error } = await supabase
                .from('costing_scenarios')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch scenarios: ${error.message}`);
            }

            return data.map(scenario => ({
                id: scenario.id,
                name: scenario.name,
                description: scenario.description,
                costItems: scenario.cost_items,
                volumePricing: scenario.volume_pricing,
                marginAnalysis: scenario.margin_analysis,
                totalCost: scenario.total_cost,
                recommendedPrice: scenario.recommended_price,
                pricingStrategy: scenario.pricing_strategy,
                isActive: scenario.is_active,
                createdAt: scenario.created_at,
                updatedAt: scenario.updated_at
            }));

        } catch (error) {
            console.error('❌ Failed to fetch scenarios:', error);
            throw new Error(`Failed to fetch costing scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Compare multiple scenarios
     */
    static compareScenarios(scenarios: CostingScenario[]): ScenarioComparison {

        if (scenarios.length < 2) {
            throw new Error('At least 2 scenarios required for comparison');
        }

        const baseScenario = scenarios[0];
        const comparisons = scenarios.slice(1).map(scenario => ({
            scenario,
            costVariance: ((scenario.totalCost - baseScenario.totalCost) / baseScenario.totalCost) * 100,
            marginVariance: ((scenario.marginAnalysis.actualMargin - baseScenario.marginAnalysis.actualMargin) /
                baseScenario.marginAnalysis.actualMargin) * 100
        }));

        // Calculate average variances
        const avgCostVariance = comparisons.reduce((sum, comp) => sum + comp.costVariance, 0) / comparisons.length;
        const avgMarginVariance = comparisons.reduce((sum, comp) => sum + comp.marginVariance, 0) / comparisons.length;

        // Find best scenario (lowest cost, highest margin)
        const bestScenario = scenarios.reduce((best, current) => {
            const bestScore = best.totalCost / (1 + best.marginAnalysis.actualMargin / 100);
            const currentScore = current.totalCost / (1 + current.marginAnalysis.actualMargin / 100);
            return currentScore < bestScore ? current : best;
        });

        return {
            scenarios,
            metrics: {
                costVariance: avgCostVariance,
                marginVariance: avgMarginVariance,
                riskVariance: 0 // TODO: Implement risk variance calculation
            },
            recommendation: {
                bestScenario: bestScenario.id || bestScenario.name,
                reasoning: `Lowest cost-to-margin ratio among ${scenarios.length} scenarios`,
                confidence: 'high'
            }
        };
    }

    /**
     * Assess costing risks
     */
    private static async assessCostingRisks(costItems: CostItem[], projectId: string): Promise<CostingRisk[]> {

        const risks: CostingRisk[] = [];

        // Material volatility risk
        const materialItems = costItems.filter(item => item.category === 'material');
        if (materialItems.length > 0) {
            const materialCostRatio = materialItems.reduce((sum, item) =>
                sum + CostCalculations.calculateItemCost(item), 0) /
                costItems.reduce((sum, item) => sum + CostCalculations.calculateItemCost(item), 0);

            if (materialCostRatio > 0.5) {
                risks.push({
                    category: 'material_volatility',
                    severity: 'high',
                    description: 'High material cost ratio increases exposure to commodity price fluctuations',
                    mitigation: 'Consider long-term supplier contracts or alternative materials',
                    impact: materialCostRatio * 100
                });
            }
        }

        // Labor cost risk
        const laborItems = costItems.filter(item => item.category === 'labor');
        if (laborItems.length > 0) {
            risks.push({
                category: 'labor_costs',
                severity: 'medium',
                description: 'Labor costs may vary based on market conditions and availability',
                mitigation: 'Build relationships with reliable staffing partners',
                impact: 15
            });
        }

        // Market competition risk
        risks.push({
            category: 'market_competition',
            severity: 'medium',
            description: 'Competitive market may require price adjustments',
            mitigation: 'Monitor competitor pricing and value proposition',
            impact: 10
        });

        // Demand uncertainty risk
        risks.push({
            category: 'demand_uncertainty',
            severity: 'low',
            description: 'Demand may vary affecting volume discounts and economies of scale',
            mitigation: 'Implement flexible production capacity and inventory management',
            impact: 8
        });

        return risks;
    }

    /**
     * Generate assumptions for costing
     */
    private static generateAssumptions(costItems: CostItem[], quantity: number): string[] {

        const assumptions = [
            'All cost inputs are accurate and current',
            'Production volume remains consistent',
            'No unexpected changes in material availability',
            'Labor rates remain stable',
            'Overhead allocation is appropriate'
        ];

        // Add quantity-specific assumptions
        if (quantity < 100) {
            assumptions.push('Small volume may result in higher per-unit costs');
        } else if (quantity > 1000) {
            assumptions.push('Large volume may qualify for additional discounts');
        }

        // Add supplier-specific assumptions
        const uniqueSuppliers = [...new Set(costItems.map(item => item.supplier).filter(Boolean))];
        if (uniqueSuppliers.length > 3) {
            assumptions.push('Multiple suppliers may increase coordination complexity');
        }

        // Add material-specific assumptions
        const materialItems = costItems.filter(item => item.category === 'material');
        if (materialItems.some(item => !item.supplier)) {
            assumptions.push('Some materials lack supplier information');
        }

        return assumptions;
    }

    /**
     * Log costing activity
     */
    private static async logCostingActivity(
        projectId: string,
        action: string,
        details: any,
        userId: string
    ) {
        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    project_id: projectId,
                    user_id: userId,
                    action,
                    details,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Failed to log costing activity:', error);
            }
        } catch (error) {
            console.warn('Activity logging failed:', error);
        }
    }

    /**
     * Get cost trends for project
     */
    static async getCostTrends(projectId: string): Promise<{
        scenarios: CostingScenario[];
        trends: {
            costReduction: number;
            marginImprovement: number;
            timeSpan: number;
        };
    }> {

        const scenarios = await this.getProjectScenarios(projectId);

        if (scenarios.length < 2) {
            return {
                scenarios: [],
                trends: {
                    costReduction: 0,
                    marginImprovement: 0,
                    timeSpan: 0
                }
            };
        }

        const sortedScenarios = scenarios.sort((a, b) =>
            new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
        );

        const firstScenario = sortedScenarios[0];
        const lastScenario = sortedScenarios[sortedScenarios.length - 1];

        const costReduction = ((firstScenario.totalCost - lastScenario.totalCost) / firstScenario.totalCost) * 100;
        const marginImprovement = lastScenario.marginAnalysis.actualMargin - firstScenario.marginAnalysis.actualMargin;

        const timeSpan = Math.round(
            (new Date(lastScenario.createdAt || '').getTime() - new Date(firstScenario.createdAt || '').getTime()) /
            (1000 * 60 * 60 * 24) // days
        );

        return {
            scenarios: sortedScenarios,
            trends: {
                costReduction,
                marginImprovement,
                timeSpan
            }
        };
    }

    /**
     * Export costing data
     */
    static exportCostingData(scenario: CostingScenario): {
        json: string;
        csv: string;
    } {

        // JSON export
        const jsonData = JSON.stringify(scenario, null, 2);

        // CSV export for cost items
        const csvHeaders = ['Category', 'Type', 'Name', 'Unit Cost', 'Quantity', 'Total Cost', 'Supplier'];
        const csvRows = scenario.costItems.map(item => [
            COSTING_CONFIG.categories[item.category].label,
            COSTING_CONFIG.types[item.type].label,
            item.name,
            item.unitCost.toString(),
            item.quantity.toString(),
            (item.unitCost * item.quantity).toString(),
            item.supplier || ''
        ]);

        const csvData = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return {
            json: jsonData,
            csv: csvData
        };
    }
}
