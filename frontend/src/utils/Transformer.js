
import StopModel from "@/models/StopModel";
import LineModel from "@/models/LineModel";

export const transformLine = (line) => {
    const start_place = new StopModel({
        id: String(line.start_place._id),
        name: line.start_place.name,
        pointX: line.start_place.pointX,
        pointY: line.start_place.pointY,
        address: line.start_place.address,
        district: line.start_place.district,
        isStation: line.start_place.isStation,
    });

    const end_place = new StopModel({
        id: String(line.end_place._id),
        name: line.end_place.name,
        pointX: line.end_place.pointX,
        pointY: line.end_place.pointY,
        address: line.end_place.address,
        district: line.end_place.district,
        isStation: line.end_place.isStation,
    });
    const arr_stop = line.arr_stop.map((stop) => new StopModel({
        id: String(stop._id),
        name: stop.name,
        pointX: stop.pointX,
        pointY: stop.pointY,
        address: stop.address,
        district: stop.district,
        isStation: stop.isStation,
    }));

    return new LineModel({
        id: String(line._id),
        name: line.name,
        start_place,
        end_place,
        time: line.time,
        arr_stop,
    });
};

export const transformStop = (stop) => {
    return new StopModel({
        id: String(stop._id),
        name: stop.name,
        address: stop.address,
        district: stop.district,
        pointX: stop.pointX,
        pointY: stop.pointY,
        isStation: stop.isStation,
    });
};