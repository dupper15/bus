const useMapViewModel = () => {
    const mapData = [
        {
            id: 1,
            name: "Stop A",
            latitude: 21.0285,
            longitude: 105.8542,
        },
        {
            id: 2,
            name: "Stop B",
            latitude: 21.0385,
            longitude: 105.8642,
        },
    ];

    return {
        mapData,
    };
};

export default useMapViewModel;
