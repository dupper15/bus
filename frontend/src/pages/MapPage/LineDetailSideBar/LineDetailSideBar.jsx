import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { linePropTypes } from "@/utils/PropTypes.js";
import StopList from "@/pages/MapPage/SubComponents/StopList/StopList.jsx";
import TabSwitch from "@/pages/MapPage/SubComponents/TabSwitch/TabSwitch.jsx";
import { useMutation } from "react-query";
import * as LineService from "@/services/LineService";

const LineDetailSideBar = ({ line, onBack, selectedStop, onSelectStop, onTabSelect }) => {
    const [activeTab, setActiveTab] = useState("details");
    const [items, setItems] = useState([]);

    const tabs = [
        { key: "details", label: "Details" },
        { key: "outbound", label: "Outbound" },
        { key: "inbound", label: "Inbound" },
    ];

    const handleTabSelect = (key) => {
        setActiveTab(key);
        if (key === "outbound" || key === "inbound") {
            onTabSelect(key);
        }
    };

    const mutationGetSchedule = useMutation({
        mutationFn: async (data) => {
            return await LineService.getAllSchedule(data);
        },
        onSuccess: (data) => {
            setItems(data.data);
        },

        onError: (error) => {
            console.log(error);
        },
    });

    useEffect(() => {
        mutationGetSchedule.mutate(line.id);
    }, [line]);

    const chunkItems = (items, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            chunks.push(items.slice(i, i + chunkSize));
        }
        return chunks;
    };
    
    const chunkedItems = chunkItems(items, 5);

    return (
        <aside className="w-full bg-white border-r border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <button
                    className="flex items-center text-sm text-gray-600 hover:text-green-500 transition-colors mb-3"
                    onClick={onBack}
                >
                    <svg className="w-4 h-4 mr-1" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h2 className="text-lg font-semibold text-gray-900">{line.name}</h2>
            </div>

            {/* Tabs */}
            <TabSwitch tabs={tabs} onTabSelect={handleTabSelect} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === "details" && (
                    <div className="p-4 space-y-3">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-500">Start Place</h3>
                            <p className="text-gray-900">{line.start_place.name}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-500">End Place</h3>
                            <p className="text-gray-900">{line.end_place.name}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                            <p className="text-gray-900">{line.time} minutes</p>
                        </div>
                        {chunkedItems.map((chunk, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4">
                                {chunk.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        className={`flex justify-center items-center p-3 border rounded-lg ${
                                            item.status === 0 ? "bg-gray-300 border-gray-400" : "bg-white border-gray-200"
                                        }`}
                                    >
                                        <span className="text-gray-900 font-medium">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "outbound" && (
                    <div className="py-2">
                        <StopList
                            stops={line.arr_stop.map(stop => stop.name)}
                            selectedStop={selectedStop}
                            onSelectStop={onSelectStop}
                        />
                    </div>
                )}

                {activeTab === "inbound" && (
                    <div className="py-2">
                        <StopList
                            stops={line.arr_stop.map(stop => stop.name).reverse()}
                            selectedStop={selectedStop}
                            onSelectStop={onSelectStop}
                        />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default LineDetailSideBar;

LineDetailSideBar.propTypes = {
    line: linePropTypes.isRequired,
    onBack: PropTypes.func.isRequired,
    selectedStop: PropTypes.string,
    onSelectStop: PropTypes.func.isRequired,
    onTabSelect: PropTypes.func.isRequired,
};

