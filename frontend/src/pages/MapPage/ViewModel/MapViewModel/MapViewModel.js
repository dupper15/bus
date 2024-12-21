import { useState } from 'react';

const useMapViewModel = () => {
    const [mapData, setMapData] = useState({
        bbox: '106.6297,10.8231,106.7,10.9', // Example bounds for Ho Chi Minh City
    });

    return {
        mapData,
    };
};

export default useMapViewModel;
