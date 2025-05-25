/**
 * PathfindingStrategy - Base class for all pathfinding strategies
 * This defines the common interface that all concrete strategies must implement
 */
class PathfindingStrategy {
    /**
     * Finds the optimal path between start and end coordinates
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Object>} - Route object with segments and metadata
     */
    async findPath(startCoords, endCoords, busStops, busLines) {
        throw new Error("findPath method must be implemented by concrete strategy");
    }

    /**
     * Calculates the score for a given path based on strategy-specific criteria
     * @param {Object} path - Path object with segments, transfers, walking distance, etc.
     * @returns {number} - Path score (lower is better)
     */
    calculatePathScore(path) {
        throw new Error("calculatePathScore method must be implemented by concrete strategy");
    }

    /**
     * Gets the display name for this strategy
     * @returns {string} - Strategy display name
     */
    getDisplayName() {
        throw new Error("getDisplayName method must be implemented by concrete strategy");
    }

    /**
     * Gets a description of what this strategy optimizes for
     * @returns {string} - Strategy description
     */
    getDescription() {
        throw new Error("getDescription method must be implemented by concrete strategy");
    }

    /**
     * Gets the icon or symbol representing this strategy
     * @returns {string} - Strategy icon/symbol
     */
    getIcon() {
        throw new Error("getIcon method must be implemented by concrete strategy");
    }

    /**
     * Common pathfinding logic shared across strategies
     * This implements the core BFS algorithm, but allows strategies to customize scoring
     */
    async executePathfinding(startCoords, endCoords, busStops, busLines, routingService) {
        try {
            // Find nearby stops using routing service
            const nearbyStartStops = routingService.findNearestStops(startCoords, busStops);
            const nearbyEndStops = routingService.findNearestStops(endCoords, busStops);

            if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
                throw new Error("No nearby bus stops found within 1km.");
            }

            // Build stop routes map
            const stopRoutesMap = this.buildStopRoutesMap(busLines);

            // Find best path using strategy-specific scoring
            const bestPath = this.findBestPathWithStrategy(
                nearbyStartStops,
                nearbyEndStops,
                stopRoutesMap,
                busLines,
                busStops,
                routingService
            );

            if (bestPath) {
                // Create route segments with directions from routing service
                const formattedPath = await routingService.createRouteSegments(
                    bestPath,
                    startCoords,
                    endCoords
                );

                return {
                    path: formattedPath,
                    metadata: {
                        strategy: this.getDisplayName(),
                        transfers: bestPath.transfers,
                        totalWalking: bestPath.totalWalking,
                        totalDistance: bestPath.totalDistance,
                        score: this.calculatePathScore(bestPath)
                    }
                };
            } else {
                throw new Error("No valid path found.");
            }
        } catch (error) {
            throw new Error(error.message || "An error occurred while finding the path.");
        }
    }

    /**
     * Builds a map of stops to the bus lines that serve them
     */
    buildStopRoutesMap(busLines) {
        const stopRoutes = new Map();

        busLines.forEach((line) => {
            line.arr_stop.forEach((stop) => {
                if (!stopRoutes.has(stop.id)) {
                    stopRoutes.set(stop.id, new Set());
                }
                stopRoutes.get(stop.id).add(line);
            });
        });

        return stopRoutes;
    }

    /**
     * Core pathfinding algorithm with strategy-specific scoring
     */
    findBestPathWithStrategy(startStops, endStops, stopRoutesMap, busLines, busStops, routingService) {
        const queue = new Queue();
        const visited = new Map();

        // Initialize queue with start stops
        startStops.forEach(({ stop: startStop, distance: initialWalk }) => {
            queue.enqueue({
                currentStop: startStop,
                path: [startStop],
                lines: [],
                transfers: 0,
                totalWalking: initialWalk,
                totalDistance: initialWalk,
                segments: [{
                    type: 'walking',
                    distance: initialWalk,
                    from: 'start',
                    to: startStop
                }]
            });
        });

        let bestPath = null;
        let minScore = Infinity;

        while (!queue.isEmpty()) {
            const current = queue.dequeue();

            // Check if we've reached any end stop
            const endStopMatch = endStops.find(
                ({ stop }) => stop.id === current.currentStop.id
            );

            if (endStopMatch) {
                const pathWithFinalWalk = {
                    ...current,
                    totalWalking: current.totalWalking + endStopMatch.distance,
                    totalDistance: current.totalDistance + endStopMatch.distance
                };

                const finalScore = this.calculatePathScore(pathWithFinalWalk);

                if (finalScore < minScore) {
                    minScore = finalScore;
                    bestPath = {
                        ...pathWithFinalWalk,
                        segments: [...current.segments],
                        finalWalkDistance: endStopMatch.distance
                    };
                }
                continue;
            }

            // Don't explore if we've exceeded reasonable limits
            if (current.transfers >= 3 || current.totalWalking >= 4) continue;

            const currentRoutes = stopRoutesMap.get(current.currentStop.id);
            if (!currentRoutes) continue;

            // Explore bus routes
            currentRoutes.forEach(line => {
                const lineStops = line.arr_stop;
                const currentStopIndex = lineStops.findIndex(
                    s => s.id === current.currentStop.id
                );

                if (currentStopIndex === -1) return;

                // Try both directions
                [lineStops, [...lineStops].reverse()].forEach(stops => {
                    const stopIndex = stops.findIndex(
                        s => s.id === current.currentStop.id
                    );

                    // Explore next stops in this direction
                    for (let i = stopIndex + 1; i < stops.length; i++) {
                        const nextStop = stops[i];
                        const key = `${nextStop.id}-${current.transfers}`;

                        if (visited.has(key)) continue;
                        visited.set(key, true);

                        const isNewLine = !current.lines.includes(line);
                        const newTransfers = isNewLine ?
                            current.transfers + 1 :
                            current.transfers;

                        // Get intermediate stops
                        const intermediateStops = stops.slice(stopIndex, i + 1);

                        queue.enqueue({
                            currentStop: nextStop,
                            path: [...current.path, nextStop],
                            lines: isNewLine ?
                                [...current.lines, line] :
                                current.lines,
                            transfers: newTransfers,
                            totalWalking: current.totalWalking,
                            totalDistance: current.totalDistance,
                            segments: [
                                ...current.segments,
                                {
                                    type: 'bus',
                                    line: line,
                                    from: current.currentStop,
                                    to: nextStop,
                                    intermediateStops: intermediateStops
                                }
                            ]
                        });
                    }
                });
            });

            // Explore walking transfers
            const nearbyStops = routingService.findNearestStops(
                [current.currentStop.pointX, current.currentStop.pointY],
                busStops
            );

            nearbyStops.forEach(({ stop: nearStop, distance }) => {
                if (distance > 1 || nearStop.id === current.currentStop.id) return;

                const totalWalking = current.totalWalking + distance;
                if (totalWalking > 4) return;

                const key = `${nearStop.id}-${current.transfers}`;
                if (visited.has(key)) return;

                queue.enqueue({
                    currentStop: nearStop,
                    path: [...current.path, nearStop],
                    lines: current.lines,
                    transfers: current.transfers,
                    totalWalking: totalWalking,
                    totalDistance: current.totalDistance + distance,
                    segments: [
                        ...current.segments,
                        {
                            type: 'walking',
                            distance: distance,
                            from: current.currentStop,
                            to: nearStop
                        }
                    ]
                });
            });
        }

        return bestPath;
    }
}

// Queue implementation for pathfinding
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

export default PathfindingStrategy;