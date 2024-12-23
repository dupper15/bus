import LineItem from "@/pages/MapPage/LineItem/LineItem.jsx";
import PropTypes from "prop-types";
import {linePropTypes} from "@/utils/PropTypes.js";

const Sidebar = ({ lines, onSelectLine }) => {
    return (
        <aside className="w-1/4 bg-gray-50 p-4 border-r border-gray-200">
            <input
                type="text"
                placeholder="Find a line"
                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="space-y-2">
                {lines.map((line) => (
                    <LineItem key={line.id} line={line} onSelect={onSelectLine} />
                ))}
            </div>
        </aside>
    );
};

Sidebar.propTypes = {
    lines: PropTypes.arrayOf(linePropTypes).isRequired,
    onSelectLine: PropTypes.func.isRequired,
};

export default Sidebar;
