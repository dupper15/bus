import BalancedStrategy from './BalancedStrategy.js';
import FastestRouteStrategy from './FastestRouteStrategy.js';
import FewestTransfersStrategy from './FewestTransfersStrategy.js';
import Route from '@/components/Route/Route.jsx';

class RouteFinderContext {
    constructor() {
        this.strategies = new Map();
        this.registerStrategy(new BalancedStrategy());
        this.registerStrategy(new FastestRouteStrategy());
        this.registerStrategy(new FewestTransfersStrategy());

        this.currentStrategy = this.strategies.get('balanced');
        this.userPreferences = {};
        this.contextData = {};
    }

    registerStrategy(strategy) {
        if (!strategy || typeof strategy.findPath !== 'function') {
            throw new Error('Invalid strategy: must have findPath method');
        }

        this.strategies.set(strategy.type, strategy);
    }

    setStrategy(strategyType) {
        const strategy = this.strategies.get(strategyType);
        if (!strategy) {
            throw new Error(`Strategy '${strategyType}' not found`);
        }

        this.currentStrategy = strategy;

        this.userPreferences.preferredStrategy = strategyType;
    }

    getCurrentStrategy() {
        return this.currentStrategy;
    }

    getCurrentStrategyType() {
        return this.currentStrategy.type;
    }

    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            this.validateInputs(startCoords, endCoords, busStops, busLines);

            this.updateContext(startCoords, endCoords, busStops, busLines);

            const result = await this.currentStrategy.findPath(
                startCoords,
                endCoords,
                busStops,
                busLines
            );

            this.validateResult(result);

            return this.enhanceResult(result);
        } catch (error) {
            console.error('Error in RouteFinderContext.findPath:', error);

            return this.createFallbackResult(startCoords, endCoords, error);
        }
    }

    async compareStrategies(startCoords, endCoords, busStops, busLines) {
        const results = [];
        const originalStrategy = this.currentStrategy;

        try {
            for (let [strategyType, strategy] of this.strategies) {
                try {
                    this.currentStrategy = strategy;

                    const result = await this.findPath(startCoords, endCoords, busStops, busLines);

                    if (result && result.path instanceof Route) {
                        results.push({
                            strategyUsed: strategy.getInfo(),
                            path: result.path,
                            metadata: result.metadata,
                            score: this.calculateComparisonScore(result.path, strategy.type)
                        });
                    }
                } catch (error) {
                    console.warn(`Strategy ${strategyType} failed:`, error);
                }
            }

            results.sort((a, b) => a.score - b.score);

            return results;
        } finally {
            this.currentStrategy = originalStrategy;
        }
    }

    getStrategyRecommendations(context = {}) {
        const recommendations = [];

        for (let [strategyType, strategy] of this.strategies) {
            if (strategy.isSuitableFor(context)) {
                recommendations.push({
                    strategy: strategy.getInfo(),
                    priority: strategy.getPriority(context),
                    explanation: strategy.getExplanation(),
                    suitabilityReason: this.getSuitabilityReason(strategy, context)
                });
            }
        }

        recommendations.sort((a, b) => a.priority - b.priority);

        return recommendations;
    }

    getAvailableStrategies() {
        return Array.from(this.strategies.values()).map(strategy => ({
            key: strategy.type,
            type: strategy.type,
            name: strategy.name,
            icon: strategy.icon,
            description: strategy.description
        }));
    }

    getStrategyExplanation(strategyType) {
        const strategy = this.strategies.get(strategyType);
        return strategy ? strategy.getExplanation() : 'Unknown strategy';
    }

    setUserPreferences(preferences) {
        this.userPreferences = { ...this.userPreferences, ...preferences };

        if (preferences.autoSelectStrategy !== false) {
            this.autoSelectStrategy();
        }
    }

    getUserPreferences() {
        return { ...this.userPreferences };
    }

    clearUserPreference() {
        this.userPreferences = {};
        this.currentStrategy = this.strategies.get('balanced');
    }

    resetToDefault() {
        this.currentStrategy = this.strategies.get('balanced');
        this.contextData = {};
    }

    validateInputs(startCoords, endCoords, busStops, busLines) {
        if (!Array.isArray(startCoords) || startCoords.length !== 2) {
            throw new Error('Invalid start coordinates');
        }

        if (!Array.isArray(endCoords) || endCoords.length !== 2) {
            throw new Error('Invalid end coordinates');
        }

        if (!Array.isArray(busStops)) {
            throw new Error('Bus stops must be an array');
        }

        if (!Array.isArray(busLines)) {
            throw new Error('Bus lines must be an array');
        }
    }

    validateResult(result) {
        if (!result || typeof result !== 'object') {
            throw new Error('Strategy returned invalid result');
        }

        if (!(result.path instanceof Route)) {
            throw new Error('Strategy must return a Route composite object');
        }

        if (!result.path.isValid()) {
            console.warn('Strategy returned invalid route');
        }
    }

    updateContext(startCoords, endCoords, busStops, busLines) {
        const distance = this.calculateDistance(startCoords, endCoords);
        const timeOfDay = new Date().getHours();

        this.contextData = {
            directDistance: distance,
            isLongDistance: distance > 10,
            isShortDistance: distance < 2,
            timeOfDay: timeOfDay,
            isPeakHour: (timeOfDay >= 7 && timeOfDay <= 9) || (timeOfDay >= 17 && timeOfDay <= 19),
            availableStops: busStops.length,
            availableLines: busLines.length,
            timestamp: new Date().toISOString()
        };
    }

    enhanceResult(result) {
        return {
            ...result,
            metadata: {
                ...result.metadata,
                contextUsed: this.contextData,
                userPreferences: this.userPreferences,
                strategySelected: this.currentStrategy.getInfo(),
                timestamp: new Date().toISOString()
            }
        };
    }

    createFallbackResult(startCoords, endCoords, error) {
        const fallbackRoute = new Route({
            name: 'Walking Route (Fallback)',
            components: [],
            strategy: 'fallback',
            metadata: {
                isFallback: true,
                originalError: error.message,
                created: new Date().toISOString()
            }
        });

        return {
            path: fallbackRoute,
            metadata: {
                strategy: 'fallback',
                error: error.message,
                isFallback: true
            }
        };
    }

    autoSelectStrategy() {
        const context = {
            ...this.contextData,
            ...this.userPreferences
        };

        const recommendations = this.getStrategyRecommendations(context);

        if (recommendations.length > 0) {
            const bestStrategy = recommendations[0].strategy.type;
            if (this.strategies.has(bestStrategy)) {
                this.setStrategy(bestStrategy);
            }
        }
    }

    calculateComparisonScore(route, strategyType) {
        if (!(route instanceof Route)) {
            return Infinity;
        }

        let score = route.calculateOptimizationScore();

        switch (strategyType) {
            case 'fastest':
                score -= route.getDuration() * 0.5;
                break;
            case 'fewesttransfers':
                score += route.getTransferCount() * 20;
                break;
            case 'balanced':
                break;
        }

        if (this.contextData.isLongDistance && strategyType === 'fastest') {
            score -= 10;
        }

        if (this.contextData.isPeakHour && strategyType === 'fewesttransfers') {
            score -= 5;
        }

        return score;
    }

    getSuitabilityReason(strategy, context) {
        const reasons = [];

        if (context.prioritizeSpeed && strategy.type === 'fastest') {
            reasons.push('prioritizes speed');
        }

        if (context.avoidTransfers && strategy.type === 'fewesttransfers') {
            reasons.push('minimizes transfers');
        }

        if (context.mobilityConstraints && strategy.type === 'fewesttransfers') {
            reasons.push('suitable for mobility constraints');
        }

        if (this.contextData.isPeakHour && strategy.type === 'balanced') {
            reasons.push('good for peak hour travel');
        }

        return reasons.length > 0 ? reasons.join(', ') : 'general suitability';
    }

    calculateDistance(coord1, coord2) {
        const [lng1, lat1] = coord1;
        const [lng2, lat2] = coord2;

        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    getContextStats() {
        return {
            currentStrategy: this.currentStrategy.getInfo(),
            availableStrategies: this.strategies.size,
            userPreferences: Object.keys(this.userPreferences).length,
            contextData: this.contextData,
            lastUsed: new Date().toISOString()
        };
    }

    exportConfiguration() {
        return {
            currentStrategyType: this.currentStrategy.type,
            userPreferences: this.userPreferences,
            availableStrategies: this.getAvailableStrategies(),
            contextData: this.contextData
        };
    }

    importConfiguration(config) {
        if (config.currentStrategyType && this.strategies.has(config.currentStrategyType)) {
            this.setStrategy(config.currentStrategyType);
        }

        if (config.userPreferences) {
            this.setUserPreferences(config.userPreferences);
        }

        if (config.contextData) {
            this.contextData = { ...config.contextData };
        }
    }
}

const routeFinderContext = new RouteFinderContext();
export default routeFinderContext;