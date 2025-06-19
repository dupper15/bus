import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import DistrictCollection from '@/models/DistrictCollection';
import StopList from '../SubComponents/StopList/StopList';

const DistrictTab = ({ lines, onSelectStop }) => {
    // Memoize the DistrictCollection to avoid re-calculating on every render
    const districtCollection = useMemo(() => new DistrictCollection(lines), [lines]);
    const districtNames = useMemo(() => districtCollection.getDistrictNames(), [districtCollection]);

    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedStop, setSelectedStop] = useState(null);

    const handleSelectDistrict = (districtName) => {
        setSelectedDistrict(districtName);
        setSelectedStop(null); // Reset selected stop when changing district
    };

    const handleSelectStop = (stopName) => {
        const stops = districtCollection.getStopsInDistrict(selectedDistrict);
        const stop = stops.find(s => s.name === stopName);
        if (stop) {
            setSelectedStop(stop.name);
            onSelectStop(stop); // Pass the full stop object up
        }
    };
    
    return (
        <div className="flex h-full">
            {/* Cột danh sách các quận */}
            <div className="w-1/3 border-r overflow-y-auto">
                <h3 className="p-2 font-semibold text-center bg-gray-50">Quận</h3>
                <ul>
                    {districtNames.map(name => (
                        <li key={name}>
                            <button
                                onClick={() => handleSelectDistrict(name)}
                                className={`w-full text-left p-2 text-sm hover:bg-gray-100 ${selectedDistrict === name ? 'bg-blue-100 font-bold' : ''}`}
                            >
                                {name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Cột danh sách các trạm dừng trong quận được chọn */}
            <div className="w-2/3 overflow-y-auto">
                <h3 className="p-2 font-semibold text-center bg-gray-50">Trạm Dừng</h3>
                {selectedDistrict ? (
                    <StopList
                        stops={districtCollection.getStopsInDistrict(selectedDistrict).map(s => s.name)}
                        selectedStop={selectedStop}
                        onSelectStop={handleSelectStop}
                    />
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        Vui lòng chọn một quận để xem các trạm dừng.
                    </div>
                )}
            </div>
        </div>
    );
};

DistrictTab.propTypes = {
    lines: PropTypes.array.isRequired,
    onSelectStop: PropTypes.func.isRequired,
};

export default DistrictTab; 