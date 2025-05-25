import React, { useState } from 'react';
import Route from '@/components/Route/Route.jsx';
import WalkingSegment from '@/components/Route/WalkingSegment.jsx';
import BusSegment from '@/components/Route/BusSegment.jsx';

/**
 * RouteDetails - Updated to use Composite pattern
 * Now handles both legacy path arrays and new Route composite objects
 */
const RouteDetails = ({ path, route, fare = "6k VND" }) => {
    const [activeTab, setActiveTab] = useState('details');

    // Handle both legacy and composite pattern data
    const routeObject = getRouteObject(path, route);

    // Safety check for route data
    if (!routeObject || !routeObject.isValid()) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-center">No valid route information available</p>
            </div>
        );
    }

    const renderRouteDetails = () => {
        // Use the composite pattern's render method
        return (
            <div className="p-6">
                {routeObject.render()}
            </div>
        );
    };

    const renderPassingStops = () => {
        // Use the composite pattern's renderAllStops method
        return (
            <div className="p-6">
                {routeObject.renderAllStops()}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Route header with composite pattern summary */}
            <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {routeObject.name || 'Your Route'}
                    </h2>
                    <div className="text-sm text-gray-600">
                        Strategy: {routeObject.strategy}
                    </div>
                </div>

                {/* Quick summary */}
                <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-medium text-gray-900">{routeObject.getDistance().toFixed(1)}km</div>
                        <div className="text-gray-500">Distance</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-gray-900">{routeObject.getDuration()} min</div>
                        <div className="text-gray-500">Duration</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-gray-900">{routeObject.getTransferCount()}</div>
                        <div className="text-gray-500">Transfers</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-gray-900">{(routeObject.getCost() / 1000).toFixed(0)}k</div>
                        <div className="text-gray-500">VND</div>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-4 text-center font-medium transition-colors
                        ${activeTab === 'details'
                        ? 'text-green-600 border-b-2 border-green-500'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Route details
                </button>
                <button
                    onClick={() => setActiveTab('stops')}
                    className={`flex-1 py-4 text-center font-medium transition-colors
                        ${activeTab === 'stops'
                        ? 'text-green-600 border-b-2 border-green-500'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Passing stops
                </button>
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 py-4 text-center font-medium transition-colors
                        ${activeTab === 'summary'
                        ? 'text-green-600 border-b-2 border-green-500'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Summary
                </button>
            </div>

            {/* Tab content */}
            {activeTab === 'details' && renderRouteDetails()}
            {activeTab === 'stops' && renderPassingStops()}
            {activeTab === 'summary' && renderRouteSummary()}
        </div>
    );

    function renderRouteSummary() {
        const summary = routeObject.getSummary();

        return (
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Route Information</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Strategy:</span>
                                <span className="font-medium">{summary.strategy}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Segments:</span>
                                <span className="font-medium">{summary.segments}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Confidence:</span>
                                <span className="font-medium">{(summary.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Score:</span>
                                <span className="font-medium">{summary.optimizationScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* Transportation Breakdown */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Transportation</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Walking segments:</span>
                                <span className="font-medium">{summary.walkingSegments}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Bus segments:</span>
                                <span className="font-medium">{summary.busSegments}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Walking distance:</span>
                                <span className="font-medium">{summary.walkingDistance.toFixed(1)}km</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Bus distance:</span>
                                <span className="font-medium">{summary.busDistance.toFixed(1)}km</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bus Lines Used */}
                {summary.busLines.length > 0 && (
                    <div className="pt-4 border-t">
                        <h3 className="font-medium text-gray-900 mb-3">Bus Lines Used</h3>
                        <div className="flex flex-wrap gap-2">
                            {summary.busLines.map((line, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                >
                                    {line}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Environmental Impact */}
                <div className="pt-4 border-t">
                    <h3 className="font-medium text-gray-900 mb-3">Environmental Impact</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="font-medium text-green-800">CO₂ Saved</div>
                            <div className="text-green-600 mt-1">
                                ~{(summary.busDistance * 0.12).toFixed(1)} kg
                            </div>
                            <div className="text-green-500 text-xs mt-1">vs. driving alone</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="font-medium text-blue-800">Steps Taken</div>
                            <div className="text-blue-600 mt-1">
                                ~{Math.round(summary.walkingDistance * 1300)}
                            </div>
                            <div className="text-blue-500 text-xs mt-1">walking distance</div>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                {summary.metadata && Object.keys(summary.metadata).length > 0 && (
                    <div className="pt-4 border-t">
                        <h3 className="font-medium text-gray-900 mb-3">Additional Information</h3>
                        <div className="text-sm text-gray-600">
                            <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto">
                                {JSON.stringify(summary.metadata, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        );
    }
};

/**
 * Helper function to convert legacy path data to Route composite object
 * @param {Array} path - Legacy path array
 * @param {Route} route - Route composite object
 * @returns {Route} - Route composite object
 */
function getRouteObject(path, route) {
    // If already a Route composite object, return it
    if (route instanceof Route) {
        return route;
    }

    // If we have a legacy path array, convert it
    if (Array.isArray(path) && path.length > 0) {
        return Route.fromLegacyData({ segments: path });
    }

    // If route is a plain object, try to construct from it
    if (route && typeof route === 'object') {
        if (route.components || route.segments) {
            return Route.fromJSON(route);
        }
        // Try to treat as legacy data
        return Route.fromLegacyData(route);
    }

    return null;
}

/**
 * Legacy compatibility wrapper - maintains backward compatibility
 */
const LegacyRouteDetails = ({ path, fare }) => {
    return <RouteDetails path={path} fare={fare} />;
};

export default RouteDetails;
export { LegacyRouteDetails };