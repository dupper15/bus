import React, { useState } from 'react';
import { FaWalking, FaBus, FaCircle } from 'react-icons/fa';

const calculateWalkingTime = (distanceKm) => {
    const walkingTimeHours = distanceKm / 5;
    return Math.round(walkingTimeHours * 60);
};

const calculateBusTime = (distanceKm) => {
    const busTimeHours = distanceKm / 20;
    return Math.round(busTimeHours * 60);
};

const RouteDetails = ({ path, fare = "6k VND" }) => {
    const [activeTab, setActiveTab] = useState('details');
    if (!path || path.length === 0) return null;

    const renderRouteDetails = () => (
        <div className="p-6 space-y-6">
            {path.map((segment, index) => {
                const isWalking = segment.type === 'walking';
                const distance = segment.distance;
                const time = isWalking
                    ? calculateWalkingTime(distance)
                    : calculateBusTime(distance);

                return (
                    <div key={index} className="flex items-start gap-5">
                        <div className="mt-1">
                            {isWalking ? (
                                <FaWalking className="text-gray-600 text-xl" />
                            ) : (
                                <FaBus className="text-gray-600 text-xl" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <p className="text-gray-900 font-medium text-base">
                                        {isWalking ? (
                                            `Walk to ${segment.to?.name || 'destination'}`
                                        ) : (
                                            `Take ${segment.line?.name || 'Bus'} towards ${segment.to[segment.to.length - 1].name}`
                                        )}
                                    </p>
                                    <p className="text-gray-500 mt-1">
                                        {isWalking ? (
                                            `From ${segment.from?.name || 'current location'}`
                                        ) : (
                                            `From ${segment.from?.name} to ${segment.to[segment.to.length - 1].name}`
                                        )}
                                    </p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-green-600 font-medium">{time} mins</p>
                                    <p className="text-gray-500 mt-1">
                                        {distance.toFixed(1)}km
                                    </p>
                                </div>
                            </div>

                            {!isWalking && (
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        {fare}
                                    </span>
                                    <span className="text-gray-500">
                                        • Next bus in {Math.floor(Math.random() * 10) + 1} mins
                                    </span>
                                    {segment.to.length > 2 && (
                                        <span className="text-gray-500">
                                            • {segment.to.length - 2} stops
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="pt-4 border-t mt-6">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Total distance: {path.reduce((acc, seg) => acc + (seg.distance || 0), 0).toFixed(1)}km</span>
                    <span>Total time: {path.reduce((acc, seg) => {
                        const dist = seg.distance || 0;
                        return acc + (seg.type === 'walking' ? calculateWalkingTime(dist) : calculateBusTime(dist));
                    }, 0)} mins</span>
                </div>
            </div>
        </div>
    );

    const renderPassingStops = () => (
        <div className="p-6">
            {path.map((segment, segmentIndex) => (
                <div key={segmentIndex} className="mb-6 last:mb-0">
                    {segment.type === 'bus' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <FaBus className="text-gray-600 text-xl" />
                                <span className="font-medium">{segment.line?.name}</span>
                            </div>
                            <div className="space-y-3 pl-8">
                                {segment.to.map((stop, stopIndex) => (
                                    <div key={stopIndex} className="flex items-center gap-3">
                                        <div className="relative flex items-center">
                                            <FaCircle className={`w-2 h-2 ${stopIndex === 0 || stopIndex === segment.to.length - 1 ? 'text-green-500' : 'text-gray-400'}`} />
                                            {stopIndex !== segment.to.length - 1 && (
                                                <div className="absolute top-3 left-1 w-px h-6 bg-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{stop.name}</p>
                                            <p className="text-sm text-gray-500">{stop.address}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow">
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
            </div>

            {activeTab === 'details' ? renderRouteDetails() : renderPassingStops()}
        </div>
    );
};

export default RouteDetails;