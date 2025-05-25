import PathfindingStrategy from './PathfindingStrategy.js';

/**
 * FastestRouteStrategy - Optimizes for minimal travel time
 */
export class FastestRouteStrategy extends PathfindingStrategy {
    constructor() {
        super();
        this.busSpeedFactor = 20; // km/h average bus speed
        this.walkingSpeedFactor = 5; // km/h walking speed
    }

    async findPath(startCoords, endCoords, busStops, busLines, routingService) {
        return await this.executePathfinding(startCoords, endCoords, busStops, busLines, routingService);
    }

    calculatePathScore(path) {
        // Prioritize time above all else
        const walkingTime = path.totalWalking / this.walkingSpeedFactor * 60; // minutes
        const busTime = (path.totalDistance - path.totalWalking) / this.busSpeedFactor * 60; // minutes
        const transferPenalty = path.transfers * 5; // 5 minutes per transfer

        return walkingTime + busTime + transferPenalty;
    }

    getDisplayName() {
        return "Fastest Route";
    }

    getDescription() {
        return "Minimizes total travel time";
    }

    getIcon() {
        return "⚡";
    }
}

/**
 * FewestTransfersStrategy - Minimizes bus line changes
 */
export class FewestTransfersStrategy extends PathfindingStrategy {
    constructor() {
        super();
        this.transferPenalty = 100; // Heavy penalty for transfers
    }

    async findPath(startCoords, endCoords, busStops, busLines, routingService) {
        return await this.executePathfinding(startCoords, endCoords, busStops, busLines, routingService);
    }

    calculatePathScore(path) {
        // Heavily penalize transfers
        const transferScore = path.transfers * this.transferPenalty;
        const distanceScore = path.totalDistance * 1; // Light distance consideration

        return transferScore + distanceScore;
    }

    getDisplayName() {
        return "Fewest Transfers";
    }

    getDescription() {
        return "Minimizes the number of bus changes";
    }

    getIcon() {
        return "🔄";
    }
}

/**
 * MinimalWalkingStrategy - Reduces walking distance for accessibility
 */
export class MinimalWalkingStrategy extends PathfindingStrategy {
    constructor() {
        super();
        this.walkingPenalty = 50; // Heavy penalty for walking
    }

    async findPath(startCoords, endCoords, busStops, busLines, routingService) {
        return await this.executePathfinding(startCoords, endCoords, busStops, busLines, routingService);
    }

    calculatePathScore(path) {
        // Heavily penalize walking distance
        const walkingScore = path.totalWalking * this.walkingPenalty;
        const transferScore = path.transfers * 10; // Moderate transfer penalty
        const distanceScore = (path.totalDistance - path.totalWalking) * 1; // Light bus distance consideration

        return walkingScore + transferScore + distanceScore;
    }

    getDisplayName() {
        return "Minimal Walking";
    }

    getDescription() {
        return "Reduces walking distance for accessibility";
    }

    getIcon() {
        return "♿";
    }
}

/**
 * BalancedStrategy - Provides weighted optimization across multiple factors
 */
export class BalancedStrategy extends PathfindingStrategy {
    constructor() {
        super();
        this.transferWeight = 2;
        this.walkingWeight = 1.5;
        this.distanceWeight = 1;
        this.timeWeight = 1.2;
    }

    async findPath(startCoords, endCoords, busStops, busLines, routingService) {
        return await this.executePathfinding(startCoords, endCoords, busStops, busLines, routingService);
    }

    calculatePathScore(path) {
        // Balanced consideration of all factors
        const transferScore = path.transfers * this.transferWeight;
        const walkingScore = path.totalWalking * this.walkingWeight;
        const distanceScore = path.totalDistance * this.distanceWeight;

        // Estimate time and include in score
        const estimatedTime = (path.totalWalking / 5 + (path.totalDistance - path.totalWalking) / 20) * 60; // minutes
        const timeScore = estimatedTime * this.timeWeight / 10; // Normalize time score

        return transferScore + walkingScore + distanceScore + timeScore;
    }

    getDisplayName() {
        return "Balanced";
    }

    getDescription() {
        return "Optimizes across time, transfers, and walking distance";
    }

    getIcon() {
        return "⚖️";
    }
}

// Strategy registry for easy access
export const PATHFINDING_STRATEGIES = {
    FASTEST: 'fastest',
    FEWEST_TRANSFERS: 'fewest_transfers',
    MINIMAL_WALKING: 'minimal_walking',
    BALANCED: 'balanced'
};

// Factory function to create strategy instances
export function createStrategy(strategyType) {
    switch (strategyType) {
        case PATHFINDING_STRATEGIES.FASTEST:
            return new FastestRouteStrategy();
        case PATHFINDING_STRATEGIES.FEWEST_TRANSFERS:
            return new FewestTransfersStrategy();
        case PATHFINDING_STRATEGIES.MINIMAL_WALKING:
            return new MinimalWalkingStrategy();
        case PATHFINDING_STRATEGIES.BALANCED:
        default:
            return new BalancedStrategy();
    }
}

// Get all available strategies for UI display
export function getAvailableStrategies() {
    return [
        {
            key: PATHFINDING_STRATEGIES.FASTEST,
            strategy: new FastestRouteStrategy()
        },
        {
            key: PATHFINDING_STRATEGIES.FEWEST_TRANSFERS,
            strategy: new FewestTransfersStrategy()
        },
        {
            key: PATHFINDING_STRATEGIES.MINIMAL_WALKING,
            strategy: new MinimalWalkingStrategy()
        },
        {
            key: PATHFINDING_STRATEGIES.BALANCED,
            strategy: new BalancedStrategy()
        }
    ];
}