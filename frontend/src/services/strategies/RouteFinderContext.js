import BalancedStrategy from './BalancedStrategy.js';
import FastestRouteStrategy from './FastestRouteStrategy.js';
import FewestTransfersStrategy from './FewestTransfersStrategy.js';
import Route from '@/components/Route/Route.jsx';

/**
 * RouteFinderContext - Enhanced Strategy pattern context with Composite pattern support
 * Manages different pathfinding strategies and returns Route composite objects
 */
class RouteFinderContext {
    constructor() {
        // Initialize available strategies
        this.strategies = new Map();
        this.registerStrategy(new BalancedStrategy());
        this.registerStrategy(new FastestRouteStrategy());
        this.registerStrategy(new FewestTransfersStrategy());

        // Set default strategy
        this.currentStrategy = this.strategies.get('balanced');
        this.userPreferences = {};
        this.contextData = {};
    }

    /**
     * Registers a new pathfinding strategy
     * @param {PathfindingStrategy} strategy - Strategy to register
     */
    registerStrategy(strategy) {
        if (!strategy || typeof strategy.findPath !== 'function') {
            throw new Error('Invalid strategy: must have findPath method');
        }

        this.strategies.set(strategy.type, strategy);
    }

    /**
     * Sets the current pathfinding strategy
     * @param {string} strategyType - Type of strategy to use
     */
    setStrategy(strategyType) {
        const strategy = this.strategies.get(strategyType);
        if (!strategy) {
            throw new Error(`Strategy '${strategyType}' not found`);
        }

        this.currentStrategy = strategy;

        // Store user preference
        this.userPreferences.preferredStrategy = strategyType;
    }

    /**
     * Gets the current strategy
     * @returns {PathfindingStrategy} - Current strategy instance
     */
    getCurrentStrategy() {
        return this.currentStrategy;
    }

    /**
     * Gets the current strategy type
     * @returns {string} - Current strategy type
     */
    getCurrentStrategyType() {
        return this.currentStrategy.type;
    }

    /**
     * Finds path using the current strategy
     * Enhanced to return Route composite objects
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Object>} - Result with Route object and metadata
     */
    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            // Validate inputs
            this.validateInputs(startCoords, endCoords, busStops, busLines);

            // Update context data
            this.updateContext(startCoords, endCoords, busStops, busLines);

            // Use current strategy to find path
            const result = await this.currentStrategy.findPath(
                startCoords,
                endCoords,
                busStops,
                busLines
            );

            // Validate result
            this.validateResult(result);

            // Enhance result with context information
            return this.enhanceResult(result);
        } catch (error) {
            console.error('Error in RouteFinderContext.findPath:', error);

            // Return fallback route
            return this.createFallbackResult(startCoords, endCoords, error);
        }
    }

    /**
     * Compares all available strategies and returns results
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Array of results from all strategies
     */
    async compareStrategies(startCoords, endCoords, busStops, busLines) {
        const results = [];
        const originalStrategy = this.currentStrategy;

        try {
            // Test each strategy
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
                    // Continue with other strategies
                }
            }

            // Sort results by score (lower is better)
            results.sort((a, b) => a.score - b.score);

            return results;
        } finally {
            // Restore original strategy
            this.currentStrategy = originalStrategy;
        }
    }

    /**
     * Gets strategy recommendations based on context
     * @param {Object} context - Route context information
     * @returns {Array} - Array of recommended strategies
     */
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

        // Sort by priority (lower number = higher priority)
        recommendations.sort((a, b) => a.priority - b.priority);

        return recommendations;
    }

    /**
     * Gets information about all available strategies
     * @returns {Array} - Array of strategy information objects
     */
    getAvailableStrategies() {
        return Array.from(this.strategies.values()).map(strategy => ({
            key: strategy.type,
            type: strategy.type,
            name: strategy.name,
            icon: strategy.icon,
            description: strategy.description
        }));
    }

    /**
     * Gets explanation for a specific strategy
     * @param {string} strategyType - Strategy type to explain
     * @returns {string} - Strategy explanation
     */
    getStrategyExplanation(strategyType) {
        const strategy = this.strategies.get(strategyType);
        return strategy ? strategy.getExplanation() : 'Unknown strategy';
    }

    /**
     * Sets user preferences for route finding
     * @param {Object} preferences - User preferences
     */
    setUserPreferences(preferences) {
        this.userPreferences = { ...this.userPreferences, ...preferences };

        // Auto-select strategy based on preferences
        if (preferences.autoSelectStrategy !== false) {
            this.autoSelectStrategy();
        }
    }

    /**
     * Gets current user preferences
     * @returns {Object} - User preferences
     */
    getUserPreferences() {
        return { ...this.userPreferences };
    }

    /**
     * Clears user preferences and resets to default
     */
    clearUserPreference() {
        this.userPreferences = {};
        this.currentStrategy = this.strategies.get('balanced');
    }

    /**
     * Resets to default strategy
     */
    resetToDefault() {
        this.currentStrategy = this.strategies.get('balanced');
        this.contextData = {};
    }

    /**
     * Validates input parameters
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Bus stops array
     * @param {Array} busLines - Bus lines array
     */
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

    /**
     * Validates the result from strategy
     * @param {Object} result - Strategy result
     */
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

    /**
     * Updates context data for strategy decision making
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     */
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

    /**
     * Enhances result with additional context information
     * @param {Object} result - Original result from strategy
     * @returns {Object} - Enhanced result
     */
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

    /**
     * Creates fallback result when strategy fails
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Error} error - Original error
     * @returns {Object} - Fallback result
     */
    createFallbackResult(startCoords, endCoords, error) {
        // Create simple walking route as fallback
        const fallbackRoute = new Route({
            name: 'Walking Route (Fallback)',
            components: [], // Would need to create a basic walking segment
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

    /**
     * Automatically selects best strategy based on context and preferences
     */
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

    /**
     * Calculates comparison score for strategy results
     * @param {Route.jsx} route - Route to score
     * @param {string} strategyType - Strategy type used
     * @returns {number} - Comparison score
     */
    calculateComparisonScore(route, strategyType) {
        if (!(route instanceof Route)) {
            return Infinity;
        }

        // Base score from route optimization score
        let score = route.calculateOptimizationScore();

        // Apply strategy-specific bonuses/penalties
        switch (strategyType) {
            case 'fastest':
                // Bonus for fast routes
                score -= route.getDuration() * 0.5;
                break;
            case 'fewesttransfers':
                // Heavy penalty for transfers
                score += route.getTransferCount() * 20;
                break;
            case 'balanced':
                // No specific adjustment - use base score
                break;
        }

        // Context-based adjustments
        if (this.contextData.isLongDistance && strategyType === 'fastest') {
            score -= 10; // Bonus for fastest on long distances
        }

        if (this.contextData.isPeakHour && strategyType === 'fewesttransfers') {
            score -= 5; // Bonus for fewer transfers during peak hours
        }

        return score;
    }

    /**
     * Gets suitability reason for a strategy
     * @param {PathfindingStrategy} strategy - Strategy to evaluate
     * @param {Object} context - Route context
     * @returns {string} - Explanation of why strategy is suitable
     */
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

    /**
     * Calculates distance between two coordinates
     * @param {Array} coord1 - First coordinate [lng, lat]
     * @param {Array} coord2 - Second coordinate [lng, lat]
     * @returns {number} - Distance in km
     */
    calculateDistance(coord1, coord2) {
        const [lng1, lat1] = coord1;
        const [lng2, lat2] = coord2;

        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Gets context statistics for debugging/monitoring
     * @returns {Object} - Context statistics
     */
    getContextStats() {
        return {
            currentStrategy: this.currentStrategy.getInfo(),
            availableStrategies: this.strategies.size,
            userPreferences: Object.keys(this.userPreferences).length,
            contextData: this.contextData,
            lastUsed: new Date().toISOString()
        };
    }

    /**
     * Exports current configuration
     * @returns {Object} - Exportable configuration
     */
    exportConfiguration() {
        return {
            currentStrategyType: this.currentStrategy.type,
            userPreferences: this.userPreferences,
            availableStrategies: this.getAvailableStrategies(),
            contextData: this.contextData
        };
    }

    /**
     * Imports configuration
     * @param {Object} config - Configuration to import
     */
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

// Export singleton instance
const routeFinderContext = new RouteFinderContext();
export default routeFinderContext;