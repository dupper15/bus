import PropTypes from "prop-types";
import { useState } from "react";

const Sidebar = ({ lines, onSelectLine, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <aside className="w-1/4 bg-white shadow-lg p-6 border-r border-gray-200">
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search lines..."
                className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <ul className="list-none p-0">
                {lines.map((line) => (
                    <li key={line.id} className="mb-2">
                        <button
                            onClick={() => onSelectLine(line)}
                            className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
                        >
                            <div className="font-semibold">{line.name}</div>
                            <div className="text-sm text-gray-600">{line.start_place.name} - {line.end_place.name}</div>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

Sidebar.propTypes = {
    lines: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectLine: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
};

export default Sidebar;