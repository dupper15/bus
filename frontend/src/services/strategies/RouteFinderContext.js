import {createStrategy, PATHFINDING_STRATEGIES, getAvailableStrategies} from "@/services/strategies/PathfindingStrategies.js";
import routingService from "@/services/RoutingService.js";


/**
 * RouteFinderContext manages pathfinding strategies and provides a unified interface
 * for route finding operations. This class implements the Context part of the Strategy pattern.
 */
class RouteFinderContext {
    constructor() {
        this.currentStrategy = createStrategy(PATHFINDING_STRATEGIES.BALANCED);
        this.availableStrategies = getAvailableStrategies();
        this.routingService = routingService;

        // Load user preference if available
        this.loadUserPreference();
    }

    /**
     * Sets the current pathfinding strategy
     * @param {string} strategyType - Strategy type identifier
     */
    setStrategy(strategyType) {
        if (this.isValidStrategy(strategyType)) {
            this.currentStrategy = createStrategy(strategyType);
            this.saveUserPreference(strategyType);
        } else {
            console.warn(`Invalid strategy type: ${strategyType}. Using balanced strategy.`);
            this.currentStrategy = createStrategy(PATHFINDING_STRATEGIES.BALANCED);
        }
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
     * @returns {string} - Current strategy type identifier
     */
    getCurrentStrategyType() {
        const strategyName = this.currentStrategy.getDisplayName();
        const strategyEntry = this.availableStrategies.find(
            s => s.strategy.getDisplayName() === strategyName
        );
        return strategyEntry ? strategyEntry.key : PATHFINDING_STRATEGIES.BALANCED;
    }

    /**
     * Gets all available strategies for UI display
     * @returns {Array} - Array of strategy objects with key and strategy instance
     */
    getAvailableStrategies() {
        return this.availableStrategies.map(({ key, strategy }) => ({
            key,
            name: strategy.getDisplayName(),
            description: strategy.getDescription(),
            icon: strategy.getIcon()
        }));
    }

    /**
     * Finds the optimal path using the current strategy
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Object>} - Route result with path and metadata
     */
    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            const result = await this.currentStrategy.findPath(
                startCoords,
                endCoords,
                busStops,
                busLines,
                this.routingService
            );

            // Add strategy information to the result
            return {
                ...result,
                strategyUsed: {
                    type: this.getCurrentStrategyType(),
                    name: this.currentStrategy.getDisplayName(),
                    description: this.currentStrategy.getDescription(),
                    icon: this.currentStrategy.getIcon()
                }
            };
        } catch (error) {
            console.error('Error finding path with strategy:', this.currentStrategy.getDisplayName(), error);
            throw error;
        }
    }

    /**
     * Compares multiple strategies and returns results from all
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Array of route results from different strategies
     */
    async compareStrategies(startCoords, endCoords, busStops, busLines) {
        const results = [];

        for (const { key, strategy } of this.availableStrategies) {
            try {
                const result = await strategy.findPath(
                    startCoords,
                    endCoords,
                    busStops,
                    busLines,
                    this.routingService
                );

                results.push({
                    ...result,
                    strategyUsed: {
                        type: key,
                        name: strategy.getDisplayName(),
                        description: strategy.getDescription(),
                        icon: strategy.getIcon()
                    }
                });
            } catch (error) {
                console.error(`Error finding path with ${strategy.getDisplayName()}:`, error);
                // Continue with other strategies even if one fails
            }
        }

        // Sort results by score (lower is better)
        return results.sort((a, b) => (a.metadata?.score || Infinity) - (b.metadata?.score || Infinity));
    }

    /**
     * Gets strategy recommendations based on route characteristics
     * @param {Object} routeContext - Context about the route request
     * @returns {Array} - Recommended strategy types in order of preference
     */
    getStrategyRecommendations(routeContext = {}) {
        const recommendations = [];

        // If user has mobility constraints
        if (routeContext.accessibilityNeeds) {
            recommendations.push(PATHFINDING_STRATEGIES.MINIMAL_WALKING);
        }

        // If user is in a hurry
        if (routeContext.timeConstraints === 'urgent') {
            recommendations.push(PATHFINDING_STRATEGIES.FASTEST);
        }

        // If user dislikes transfers
        if (routeContext.transferPreference === 'avoid') {
            recommendations.push(PATHFINDING_STRATEGIES.FEWEST_TRANSFERS);
        }

        // Always include balanced as a fallback
        if (!recommendations.includes(PATHFINDING_STRATEGIES.BALANCED)) {
            recommendations.push(PATHFINDING_STRATEGIES.BALANCED);
        }

        return recommendations;
    }

    /**
     * Validates if a strategy type is supported
     * @param {string} strategyType - Strategy type to validate
     * @returns {boolean} - Whether the strategy is valid
     */
    isValidStrategy(strategyType) {
        return Object.values(PATHFINDING_STRATEGIES).includes(strategyType);
    }

    /**
     * Gets strategy statistics for analytics
     * @returns {Object} - Strategy usage statistics
     */
    getStrategyStats() {
        return {
            currentStrategy: this.getCurrentStrategyType(),
            availableStrategies: this.availableStrategies.length,
            defaultStrategy: PATHFINDING_STRATEGIES.BALANCED
        };
    }

    /**
     * Resets to default strategy
     */
    resetToDefault() {
        this.setStrategy(PATHFINDING_STRATEGIES.BALANCED);
    }

    /**
     * Loads user's preferred strategy from local storage
     * @private
     */
    loadUserPreference() {
        try {
            const savedStrategy = localStorage.getItem('busmap_preferred_strategy');
            if (savedStrategy && this.isValidStrategy(savedStrategy)) {
                this.currentStrategy = createStrategy(savedStrategy);
            }
        } catch (error) {
            console.warn('Could not load strategy preference:', error);
        }
    }

    /**
     * Saves user's preferred strategy to local storage
     * @param {string} strategyType - Strategy type to save
     * @private
     */
    saveUserPreference(strategyType) {
        try {
            localStorage.setItem('busmap_preferred_strategy', strategyType);
        } catch (error) {
            console.warn('Could not save strategy preference:', error);
        }
    }

    /**
     * Clears saved user preference
     */
    clearUserPreference() {
        try {
            localStorage.removeItem('busmap_preferred_strategy');
            this.resetToDefault();
        } catch (error) {
            console.warn('Could not clear strategy preference:', error);
        }
    }

    /**
     * Gets human-readable explanation of what each strategy optimizes
     * @param {string} strategyType - Strategy type to explain
     * @returns {string} - Detailed explanation
     */
    getStrategyExplanation(strategyType) {
        const strategy = createStrategy(strategyType);
        const explanations = {
            [PATHFINDING_STRATEGIES.FASTEST]:
                `${strategy.getDescription()}. This strategy calculates the quickest route by considering bus speeds, walking speeds, and transfer times. Best for when you're running late or need to reach your destination as quickly as possible.`,

            [PATHFINDING_STRATEGIES.FEWEST_TRANSFERS]:
                `${strategy.getDescription()}. This strategy prioritizes routes that require fewer bus line changes, even if they take slightly longer. Best for users who find transfers confusing or prefer simpler journeys.`,

            [PATHFINDING_STRATEGIES.MINIMAL_WALKING]:
                `${strategy.getDescription()}. This strategy finds routes with the shortest walking distances, making it ideal for users with mobility challenges, heavy luggage, or in bad weather conditions.`,

            [PATHFINDING_STRATEGIES.BALANCED]:
                `${strategy.getDescription()}. This strategy considers all factors - time, transfers, and walking distance - to find a well-rounded route that works well in most situations.`
        };

        return explanations[strategyType] || strategy.getDescription();
    }
}

// Export singleton instance
const routeFinderContext = new RouteFinderContext();
export default routeFinderContext;