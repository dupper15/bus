import {z} from "zod";

class LineModel {
    constructor({ id, name, start_place, end_place, time, arr_stop }) {
        this.id = id || null; // Line ID
        this.name = name || "Unnamed Line"; // Line name
        this.start_place = start_place || null; // Start stop (StopModel instance)
        this.end_place = end_place || null; // End stop (StopModel instance)
        this.time = time || 0; // Estimated time in minutes
        this.arr_stop = arr_stop || []; // Array of StopModel instances
    }
}
export default LineModel;


