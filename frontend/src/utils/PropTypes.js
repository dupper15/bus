import PropTypes from 'prop-types';

export const stopPropTypes = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    pointX: PropTypes.number.isRequired,
    pointY: PropTypes.number.isRequired,
    isStation: PropTypes.bool.isRequired,
});

export const linePropTypes = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    start_place: stopPropTypes.isRequired,
    end_place: stopPropTypes.isRequired,
    time: PropTypes.number.isRequired,
    arr_stop: PropTypes.arrayOf(stopPropTypes).isRequired,
});