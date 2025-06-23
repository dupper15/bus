import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaWalking, FaBus, FaClock } from 'react-icons/fa';
import { MdTransferWithinAStation } from 'react-icons/md';
import RouteSegment from '@/components/Route/RouteSegment.jsx';
import WalkingSegment from '@/components/Route/WalkingSegment.jsx';
import BusSegment from '@/components/Route/BusSegment.jsx';

/**
 * Enhanced RouteDetails component with quality warnings
 * Shows visual indicators for suboptimal routes when no better options are available
 *
 * @param {Object} props - Component properties
 * @returns {JSX.Element} - Enhanced route details component
 */
const EnhancedRouteDetails = ({ path, route, routeMetadata, fare = "6k VND" }) => {
    const [activeTab, setActiveTab] = useState('details');

    // Handle both legacy and composite pattern data
    const routeObject = getRouteObject(path, route);

    // Get route quality information from metadata
    const quality = routeMetadata?.routeQuality || 'good';
    const isSuboptimal = routeMetadata?.isSuboptimal || false;
    const suboptimalReasons = routeMetadata?.suboptimalReasons || [];
    const qualityIndicators = routeMetadata?.qualityIndicators || {};

    // Safety check for route data
    if (!routeObject || !routeObject.isValid()) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-center">No valid route information available</p>
            </div>
        );
    }

    /**
     * Gets quality-based styling classes
     * @param {string} quality - Route quality level
     * @returns {Object} - Styling classes
     */
    const getQualityStyles = (quality) => {
        switch (quality) {
            case 'excellent':
                return {
                    containerClass: 'bg-green-50 border-green-200',
                    headerClass: 'bg-green-100 text-green-800',
                    iconColor: 'text-green-600',
                    icon: FaCheckCircle
                };
            case 'good':
                return {
                    containerClass: 'bg-white border-gray-200',
                    headerClass: 'bg-gray-50 text-gray-800',
                    iconColor: 'text-green-500',
                    icon: FaCheckCircle
                };
            case 'acceptable':
                return {
                    containerClass: 'bg-yellow-50 border-yellow-200',
                    headerClass: 'bg-yellow-100 text-yellow-800',
                    iconColor: 'text-yellow-600',
                    icon: FaInfoCircle
                };
            case 'poor':
            default:
                return {
                    containerClass: 'bg-red-50 border-red-200',
                    headerClass: 'bg-red-100 text-red-800',
                    iconColor: 'text-red-600',
                    icon: FaExclamationTriangle
                };
        }
    };

    const qualityStyles = getQualityStyles(quality);
    const QualityIcon = qualityStyles.icon;

    /**
     * Renders route quality header with warnings
     * @returns {JSX.Element} - Quality header component
     */
    const renderQualityHeader = () => {
        if (!isSuboptimal && quality === 'good') return null;

        return (
            <div className={`p-3 mb-4 rounded-lg border ${qualityStyles.headerClass}`}>
                <div className="flex items-center gap-2">
                    <QualityIcon className={`w-5 h-5 ${qualityStyles.iconColor}`} />
                    <div className="flex-1">
                        <h4 className="font-medium">
                            {isSuboptimal ? 'Suboptimal Route' : 'Route Quality: ' + quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </h4>
                        {isSuboptimal && suboptimalReasons.length > 0 && (
                            <div className="mt-1 text-sm">
                                <p className="font-medium mb-1">Issues with this route:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    {suboptimalReasons.map((reason, index) => (
                                        <li key={index}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {isSuboptimal && (
                            <p className="mt-2 text-sm italic">
                                This route is shown because no better options were found for your journey.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders quality indicators with warnings
     * @returns {JSX.Element} - Quality indicators component
     */
    const renderQualityIndicators = () => {
        if (!qualityIndicators || Object.keys(qualityIndicators).length === 0) return null;

        return (
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Walking Distance Indicator */}
                {qualityIndicators.walkingDistance && (
                    <div className={`p-3 rounded-lg text-center ${
                        qualityIndicators.walkingDistance.warning ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}>
                        <FaWalking className={`w-5 h-5 mx-auto mb-1 ${
                            qualityIndicators.walkingDistance.warning ? 'text-red-600' : 'text-gray-600'
                        }`} />
                        <div className="text-sm">
                            <div className="font-medium">{qualityIndicators.walkingDistance.value.toFixed(1)}km</div>
                            <div className={`text-xs ${
                                qualityIndicators.walkingDistance.warning ? 'text-red-600' : 'text-gray-500'
                            }`}>Walking</div>
                        </div>
                    </div>
                )}

                {/* Duration Indicator */}
                {qualityIndicators.duration && (
                    <div className={`p-3 rounded-lg text-center ${
                        qualityIndicators.duration.warning ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}>
                        <FaClock className={`w-5 h-5 mx-auto mb-1 ${
                            qualityIndicators.duration.warning ? 'text-red-600' : 'text-gray-600'
                        }`} />
                        <div className="text-sm">
                            <div className="font-medium">{qualityIndicators.duration.value}min</div>
                            <div className={`text-xs ${
                                qualityIndicators.duration.warning ? 'text-red-600' : 'text-gray-500'
                            }`}>Total Time</div>
                        </div>
                    </div>
                )}

                {/* Transfers Indicator */}
                {qualityIndicators.transfers && (
                    <div className={`p-3 rounded-lg text-center ${
                        qualityIndicators.transfers.warning ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}>
                        <MdTransferWithinAStation className={`w-5 h-5 mx-auto mb-1 ${
                            qualityIndicators.transfers.warning ? 'text-red-600' : 'text-gray-600'
                        }`} />
                        <div className="text-sm">
                            <div className="font-medium">{qualityIndicators.transfers.value}</div>
                            <div className={`text-xs ${
                                qualityIndicators.transfers.warning ? 'text-red-600' : 'text-gray-500'
                            }`}>Transfers</div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Renders route details using Composite pattern
     * @returns {JSX.Element} - Route details content
     */
    const renderRouteDetails = () => {
        return (
            <div className="p-6">
                {renderQualityHeader()}
                {renderQualityIndicators()}
                <div className="mt-4">
                    {routeObject.render()}
                </div>
            </div>
        );
    };

    /**
     * Renders all stops in the route
     * @returns {JSX.Element} - Stops list content
     */
    const renderPassingStops = () => {
        return (
            <div className="p-6">
                {renderQualityHeader()}
                <div className="mt-4">
                    {routeObject.renderAllStops()}
                </div>
            </div>
        );
    };

    /**
     * Renders route summary with quality information
     * @returns {JSX.Element} - Route summary content
     */
    const renderRouteSummary = () => {
        const summary = routeObject.getSummary();

        return (
            <div className="p-6">
                {renderQualityHeader()}
                {renderQualityIndicators()}

                <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Total Distance</div>
                            <div className="text-lg font-medium">{summary.totalDistance?.toFixed(1) || 0}km</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Estimated Cost</div>
                            <div className="text-lg font-medium">{fare}</div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">Route Composition</div>
                        <div className="flex flex-wrap gap-2">
                            {routeObject.getComponents().map((component, index) => (
                                <span
                                    key={index}
                                    className={`px-2 py-1 rounded text-xs ${
                                        component instanceof WalkingSegment
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}
                                >
                                    {component instanceof WalkingSegment ? (
                                        <>🚶 Walk {component.getDistance().toFixed(1)}km</>
                                    ) : (
                                        <>🚌 {component.busLine?.name || 'Bus'}</>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Strategy Information */}
                    {routeMetadata?.strategyName && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Optimization Strategy</div>
                            <div className="font-medium">{routeMetadata.strategyName}</div>
                            {routeMetadata.selectionCriteria && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {routeMetadata.selectionCriteria.replace(/-/g, ' ')}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quality Score */}
                    {routeMetadata?.normalizedScore && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Route Score</div>
                            <div className="flex items-center gap-2">
                                <div className="font-medium">{routeMetadata.normalizedScore.toFixed(1)}/100</div>
                                <div className={`px-2 py-1 rounded text-xs ${
                                    quality === 'excellent' ? 'bg-green-100 text-green-800' :
                                        quality === 'good' ? 'bg-blue-100 text-blue-800' :
                                            quality === 'acceptable' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                }`}>
                                    {quality}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Main component render
    return (
        <div className={`rounded-lg shadow border-2 ${qualityStyles.containerClass}`}>
            {/* Tab navigation */}
            <div className="flex border-b border-gray-200">
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
};

/**
 * Helper function to convert legacy path data to Route composite object
 * @param {Array} path - Legacy path array
 * @param {RouteSegment} route - Route composite object
 * @returns {RouteSegment} - Route composite object
 */
function getRouteObject(path, route) {
    // If already a Route composite object, return it
    if (route instanceof RouteSegment) {
        return route;
    }

    // If we have a legacy path array, convert it to Route object
    if (Array.isArray(path) && path.length > 0) {
        return RouteSegment.fromLegacyData({ segments: path });
    }

    // If route is a plain object, try to construct from it
    if (route && typeof route === 'object') {
        if (route.components || route.segments) {
            return RouteSegment.fromJSON(route);
        }
        // Try to treat as legacy data
        return RouteSegment.fromLegacyData(route);
    }

    return null;
}

EnhancedRouteDetails.propTypes = {
    path: PropTypes.array,
    route: PropTypes.oneOfType([
        PropTypes.instanceOf(RouteSegment),
        PropTypes.object
    ]),
    routeMetadata: PropTypes.object,
    fare: PropTypes.string
};

/**
 * Legacy compatibility wrapper - maintains backward compatibility
 */
const LegacyEnhancedRouteDetails = ({ path, routeMetadata, fare }) => {
    return <EnhancedRouteDetails path={path} routeMetadata={routeMetadata} fare={fare} />;
};

export default EnhancedRouteDetails;
export { LegacyEnhancedRouteDetails };