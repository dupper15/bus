const Bus = require("../models/BusModel");
const Employee = require("../models/EmployeeModel");
const Line = require("../models/LineModel");
const Schedule = require("../models/ScheduleModel");
const Stop = require("../models/StopModel");
const getEmployeeTask = async (employeeId) => {
  try {
    // Tìm kiếm các lịch trình mà nhân viên là busboy hoặc driver
    const schedules = await Schedule.find({
      $or: [{ busboy: employeeId }, { driver: employeeId }],
    })
      // Populates các thông tin liên quan, bao gồm line và start_place (bắt buộc phải là 'Stop')
      .populate({
        path: "line",
        populate: {
          path: "start_place", // Thông tin bắt buộc từ Stop
          model: "Stop", // Chỉ rõ model là 'Stop'
        },
      })
      .populate("bus"); // Populates bus

    // Kiểm tra nếu không có dữ liệu
    if (!schedules || schedules.length === 0) {
      return {
        status: "ERROR",
        message: "No schedules found for the provided employee ID.",
        data: [],
      };
    }

    // Lọc các lịch trình có thời gian là hôm nay và loại bỏ các lịch trình có trạng thái Pending
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Lấy thời gian bắt đầu ngày hôm nay
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Lấy thời gian kết thúc ngày hôm nay

    const filteredSchedules = schedules.filter((schedule) => {
      const scheduleTime = new Date(schedule.time_start);
      return (
        scheduleTime >= startOfDay &&
        scheduleTime <= endOfDay &&
        schedule.status !== "Pending"
      );
    });

    // Sắp xếp lịch trình theo trạng thái và thời gian (Completed ở dưới cùng)
    const sortedSchedules = filteredSchedules.sort((a, b) => {
      // Sắp xếp theo trạng thái Completed ở dưới cùng
      if (a.status === "Completed" && b.status !== "Completed") return 1;
      if (a.status !== "Completed" && b.status === "Completed") return -1;

      // Sắp xếp các lịch trình còn lại theo thời gian từ sớm đến muộn
      return new Date(a.time_start) - new Date(b.time_start);
    });

    // Chuyển đổi dữ liệu sang dạng dễ sử dụng
    const formattedData = sortedSchedules.map((schedule) => ({
      scheduleId: schedule._id,
      name: schedule.line?.name, // Lấy tên line
      station: schedule.line?.start_place?.name || "Unknown", // Lấy tên start_place từ line
      time: schedule.time_start,
      status: schedule.status,
      license_plate: schedule.bus?.license_plate,
      ticket3: schedule.ticket3,
      ticket7: schedule.ticket7, // Lấy biển số xe
    }));

    return {
      status: "OK",
      message: "Schedules retrieved successfully.",
      data: formattedData,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the schedules.",
      error: e.message || e,
    };
  }
};

const createSchedule = async (data) => {
        try {
            const checkSchedule = await Schedule.findOne({line: data.line, time_start: data.time_start})
            .populate("line", "name")
            .populate("bus", "license_plate")
            if(checkSchedule){
                return({
                    status: "ERROR",
                    message: `Schedule already exists on line ${checkSchedule.line.name} at ${checkSchedule.time_start} with bus ${checkSchedule.bus.license_plate}.`,
                })
            }
            // Lấy tất cả ID hiện có và sắp xếp
            const schedules = await Schedule.find({}, { id: 1, _id: 0 }).sort({ id: 1 });

            const ids = schedules.map((schedule) => parseInt(schedule.id.replace('S', ''), 10));

            // Tìm ID nhỏ nhất bị thiếu
            let newIdNumber = 1;
            for (const id of ids) {
                if (id === newIdNumber) {
                    newIdNumber++;
                } else {
                    break;
                }
            }
            const newId = `S${String(newIdNumber).padStart(3, '0')}`;

            const createdSchedule = await Schedule.create({
                id: newId,
                bus: data.bus, 
                line: data.line, 
                driver: data.driver, 
                busboy: data.busboy, 
                time_start: data.time_start,
                time: data.time, 
            })
            if (createdSchedule) {
                return({
                    status: "OK", 
                    message: "Schedule created successfully.", 
                    data: createdSchedule
                })
            }
        } catch (e) {
            return({
                status: "ERROR", 
                message: "An error occurred while creating the schedule.", 
                error: e
            })
        }
}

const getAllSchedule = async () => {
    try {
        const allSchedule = await Schedule.find()
            .populate("bus", "_id id license_plate status")
            .populate("line", "_id id name")
            .populate("driver", "_id id name status")
            .populate("busboy", "_id id name status");

        const now = new Date();
        const offset = 7 * 60; // GMT+7 in minutes
        const localTime = new Date(now.getTime() + offset * 60 * 1000);
        const currentDate = localTime.toISOString().split("T")[0]; // Lấy ngày hiện tại ở định dạng YYYY-MM-DD

        const newSchedules = [];

        allSchedule.forEach(schedule => {
            const scheduleDate = new Date(schedule.date).toISOString().split("T")[0]; // Ngày của schedule

            // Nếu khác ngày hiện tại, tạo schedule mới
            if (scheduleDate !== currentDate) {
                const newSchedule = {
                    id: schedule.id, // Tạo ID mới
                    bus: schedule.bus,
                    line: schedule.line,
                    driver: schedule.driver,
                    busboy: schedule.busboy,
                    time_start: schedule.time_start,
                    time: schedule.time,
                    status: "Pending",
                    ticket3: 0,
                    ticket7: 0,
                    date: localTime // Ngày mới
                };

                newSchedules.push(newSchedule);
            }
        });

        // Thêm các schedule mới vào cơ sở dữ liệu
        if (newSchedules.length > 0) {
            await Schedule.insertMany(newSchedules);
        }

        // Cập nhật trạng thái cho các schedule hiện tại
        const hours = localTime.getUTCHours();
        const minutes = localTime.getUTCMinutes();

        allSchedule.forEach(schedule => {
            const [startHours, startMinutes] = schedule.time_start.split(":").map(Number);
            const startTotalMinutes = startHours * 60 + startMinutes;
            const currentTotalMinutes = hours * 60 + minutes;
            const finishTotalMinutes = startTotalMinutes + schedule.time;

            if (finishTotalMinutes <= currentTotalMinutes) {
                schedule.status = "Completed";
            } else if (startTotalMinutes <= currentTotalMinutes) {
                schedule.status = "In Progress";
            }
        });

        return ({
            status: "OK",
            message: "Schedules retrieved and updated successfully.",
            data: allSchedule
        });
    } catch (e) {
        return ({
            status: "ERROR",
            message: "An error occurred while retrieving the schedules.",
            error: e
        });
    }
};

const getAllAdd = async () => {
  try {
    const bus = await Bus.find({ status: "Active" }).select(
      "_id id license_plate"
    );
    const line = await Line.find().select("_id id name");
    const driver = await Employee.find({
      position: "Driver",
      status: "Enable",
    }).select("_id id name");
    const busboy = await Employee.find({
      position: "Bus boy",
      status: "Enable",
    }).select("_id id name");
    return {
      status: "OK",
      message: "Schedules retrieved successfully.",
      data: {
        bus: bus,
        line: line,
        driver: driver,
        busboy: busboy,
      },
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the schedules.",
      error: e,
    };
  }
};

const updateSchedule = async (data) => {
        try {
            const checkSchedule = await Schedule.findOne({line: data.line, time_start: data.time_start})
            .populate("line", "name")
            .populate("bus", "license_plate")
            if(checkSchedule){
                return({
                    status: "ERROR",
                    message: `Schedule already exists on line ${checkSchedule.line.name} at ${checkSchedule.time_start} with bus ${checkSchedule.bus.license_plate}.`,
                })
            }

            const updatedSchedule = await Schedule.findByIdAndUpdate(
                data._id, 
                data, 
                {new: true}
            );

            if (!updatedSchedule) {
                return({
                    status: "ERROR", 
                    message: "Failed to update the schedule or schedule not found."
                });
            }
            return({
                status: "OK", 
                message: "Schedule updated successfully.", 
                data: updatedSchedule
            })

        } catch (e) {
            return({
                status: "ERROR", 
                message: "An error occurred while updating the schedule.", 
                error: e
            })
        }
}

const getDetailSchedule = (ScheduleId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const schedule = await Schedule.findOne({
        _id: ScheduleId,
      });
      if (schedule === null) {
        resolve({
          status: "ERROR",
          message: "No schedule found with the provided ID.",
        });
        return;
      }
      resolve({
        status: "OK",
        message: "Schedule details retrieved successfully.",
        data: schedule,
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: "An error occurred while retrieving the schedule details.",
        error: e,
      });
    }
  });
};

const deleteSchedule = (ScheduleId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const schedule = await Schedule.findOne({
        _id: ScheduleId,
      });
      if (schedule === null) {
        resolve({
          status: "ERROR",
          message: "No schedule found with the provided ID.",
        });
        return;
      }

      await Schedule.findByIdAndDelete(ScheduleId);
      resolve({
        status: "OK",
        message: "Schedule deleted successfully.",
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: "An error occurred while deleting the schedule.",
        error: e,
      });
    }
  });
};
const employeeCheckIn = async (data) => {
  try {
    // In ra dữ liệu để debug (nếu cần)
    console.log("data", data);

    // Tìm schedule theo ID được cung cấp trong data
    const checkSchedule = await Schedule.findOne({ _id: data.scheduleId });

    // Kiểm tra nếu không tìm thấy schedule
    if (!checkSchedule) {
      return {
        status: "ERROR",
        message: "No schedule found with the provided ID.",
      };
    }

    // Kiểm tra nếu schedule đã hoàn thành
    // if (checkSchedule.status === "Completed") {
    //   return {
    //     status: "ERROR",
    //     message: "This schedule has already been completed.",
    //   };
    // }

    // Cập nhật trạng thái của schedule
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      data.scheduleId,
      {
        status: "Completed", // Cập nhật trạng thái
        ticket3: data.ticket3, // Cập nhật ticket3
        ticket7: data.ticket7, // Cập nhật ticket7
      },
      { new: true } // Trả về bản ghi đã được cập nhật
    );

    if (!updatedSchedule) {
      return {
        status: "ERROR",
        message: "Failed to update the schedule or schedule not found.",
      };
    }

    // Trả về kết quả thành công
    return {
      status: "OK",
      message: "Check-in successful.",
      data: "Check-in successful.", // Dữ liệu đã được cập nhật
    };
  } catch (e) {
    // Xử lý lỗi nếu có
    return {
      status: "ERROR",
      message: "An error occurred while checking in.",
      error: e.message || e, // Trả về thông báo lỗi chi tiết
    };
  }
};

const approveAllSchedule = async () => {
    try {
        const date = new Date().toDateString();
        const schedules = await Schedule.find({date: {$gte: date}});
        schedules.forEach(async (schedule) => {
            schedule.status = "Not start yet";
            await schedule.save();
        })
        
        return({
            status: "OK", 
            message: "Schedule updated successfully.", 
            data: schedules
        })

    } catch (e) {
        return({
            status: "ERROR", 
            message: "An error occurred while updating the schedule.", 
            error: e
        })
    }
}

module.exports = {
    createSchedule, 
    getAllSchedule, 
    updateSchedule, 
    getDetailSchedule, 
    deleteSchedule, 
    getAllAdd,
    approveAllSchedule,
   employeeCheckIn,
   getEmployeeTask,
};

