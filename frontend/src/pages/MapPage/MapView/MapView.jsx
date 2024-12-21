import PropTypes from 'prop-types';

const MapView = ({ mapData }) => {
    return (
        <div className="flex-1 relative">
            <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapData.bbox}`}
                className="w-full h-full"
                title="Map"
            ></iframe>
        </div>
    );
};

MapView.propTypes = {
    mapData: PropTypes.shape({
        bbox: PropTypes.string.isRequired,
    }).isRequired,
};

export default MapView;