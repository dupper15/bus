const Bus = require("../models/BusModel")

const createBus = async (data) => {
    try {
        // Kiểm tra xe buýt với biển số xe đã tồn tại
        const checkBus = await Bus.findOne({ license_plate: data.license_plate });
        if (checkBus !== null) {
            return {
                status: "ERROR",
                message: "A bus with this license plate already exists."
            };
        }

        // Lấy tất cả ID hiện có và sắp xếp
        const buses = await Bus.find({}, { id: 1, _id: 0 }).sort({ id: 1 });

        const ids = buses.map((bus) => parseInt(bus.id.replace('B', ''), 10));

        // Tìm ID nhỏ nhất bị thiếu
        let newIdNumber = 1;
        for (const id of ids) {
            if (id === newIdNumber) {
                newIdNumber++;
            } else {
                break;
            }
        }
        const newId = `B${String(newIdNumber).padStart(3, '0')}`;

        // Tạo xe buýt mới
        const createdBus = await Bus.create({
            id: newId,
            type: data.type,
            manufacture_year: data.manufacture_year,
            image: data.image,
            count_seat: data.count_seat,
            license_plate: data.license_plate
        });

        return {
            status: "OK",
            message: "Bus created successfully.",
            data: createdBus
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while creating the bus.",
            error: e
        };
    }
};

const updateBus = async (data) => {
    try {
        // Kiểm tra xe buýt với biển số đã tồn tại
        const checkBus = await Bus.findOne({ license_plate: data.license_plate });
        if (!checkBus) {
            return {
                status: "ERROR",
                message: "No bus found with the provided license plate."
            };
        }

        // Cập nhật thông tin xe buýt
        const updatedBus = await Bus.findByIdAndUpdate(checkBus._id, data, { new: true });
        if (!updatedBus) {
            return {
                status: "ERROR",
                message: "Failed to update the bus or bus not found."
            };
        }

        return {
            status: "OK",
            message: "Bus updated successfully.",
            data: updatedBus
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while updating the bus.",
            error: e
        };
    }
};

const getAllBus = async () => {
    try {
        const allBus = await Bus.find();
        return {
            status: "OK",
            message: "Buses retrieved successfully.",
            data: allBus
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while retrieving the buses.",
            error: e
        };
    }
};

const getDetailBus = (BusId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bus = await Bus.findOne({
                _id: BusId
            })
            if (bus === null){
                resolve({
                    status: 'ERROR',
                    message: 'No bus found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Bus details retrieved successfully.",
                data: bus
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the bus details.",
                error: e
            })
        }
    })
}

const deleteBus = async (busId) => {
    try {
        // Tìm và xóa bus bằng ID
        await Bus.findByIdAndDelete(busId);

        return {
            status: "OK",
            message: "Bus deleted successfully."
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while deleting the bus.",
            error: e
        };
    }
};


module.exports = {
    createBus,
    updateBus,
    getAllBus,
    getDetailBus,
    deleteBus
}