const Bus = require("../models/BusModel");
const Employee = require("../models/EmployeeModel");
const Line = require("../models/LineModel");
const Schedule = require("../models/ScheduleModel");
const Stop = require("../models/StopModel");

const getEmployeeTask = async (employeeId) => {
  try {
    // Lấy ngày hiện tại
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Tìm kiếm các lịch trình mà nhân viên là busboy hoặc driver trong ngày hiện tại
    const schedules = await Schedule.find({
      $or: [{ busboy: employeeId }, { driver: employeeId }],
      date: { $gte: startOfDay, $lte: endOfDay }, // Lọc theo ngày
    })
      .populate({
        path: "line",
        populate: {
          path: "start_place",
          model: "Stop", // Chỉ rõ model là 'Stop'
        },
      })
      .populate("bus");

    // Nếu không tìm thấy lịch trình nào
    if (!schedules || schedules.length === 0) {
      return {
        status: "ERROR",
        message: "No schedules found for the provided employee ID.",
        data: [],
      };
    }

    // Lọc và sắp xếp lịch trình theo trạng thái và thời gian
    const sortedSchedules = schedules
      .filter((schedule) => schedule.status !== "Pending")
      .sort((a, b) => {
        // Đưa trạng thái "Completed" xuống dưới cùng
        if (a.status === "Completed" && b.status !== "Completed") return 1;
        if (a.status !== "Completed" && b.status === "Completed") return -1;

        // Sắp xếp theo thời gian từ sớm đến muộn
        const [aHours, aMinutes] = a.time_start.split(":").map(Number);
        const [bHours, bMinutes] = b.time_start.split(":").map(Number);
        const aTime = new Date().setHours(aHours, aMinutes, 0, 0);
        const bTime = new Date().setHours(bHours, bMinutes, 0, 0);

        return aTime - bTime;
      });

    // Chuyển đổi dữ liệu sang dạng dễ sử dụng
    const formattedData = sortedSchedules.map((schedule) => ({
      _id: schedule._id,
      scheduleId: schedule.id,
      name: schedule.line?.name || "Unknown Line",
      station: schedule.line?.start_place?.name || "Unknown Station",
      time: schedule.time_start,
      status: schedule.status,
      license_plate: schedule.bus?.license_plate || "Unknown License Plate",
      ticket3: schedule.ticket3 || 0,
      ticket7: schedule.ticket7 || 0,
    }));

    return {
      status: "OK",
      message: "Schedules retrieved successfully.",
      data: formattedData,
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the schedules.",
      error: error.message || error,
    };
  }
};

const createSchedule = async (data) => {
  try {
    const checkSchedule = await Schedule.findOne({
      line: data.line,
      time_start: data.time_start,
    })
      .populate("line", "name")
      .populate("bus", "license_plate");
    if (checkSchedule) {
      return {
        status: "ERROR",
        message: `Schedule already exists on line ${checkSchedule.line.name} at ${checkSchedule.time_start} with bus ${checkSchedule.bus.license_plate}.`,
      };
    }

    const lineCheck = await Line.findById(data.line);

    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const newScheduleStart = parseTime(data.time_start);
    const newScheduleEnd = newScheduleStart + lineCheck.time;

    const allScheduleBusboy = await Schedule.find({ busboy: data.busboy })
      .populate("busboy", "name")
      .populate("line", "time name");

    const allScheduleDriver = await Schedule.find({ driver: data.driver })
      .populate("driver", "name")
      .populate("line", "time name");

    for (const schedule of allScheduleBusboy) {
      const existingStart = parseTime(schedule.time_start);
      const existingEnd = existingStart + schedule.line.time;

      if (newScheduleStart > existingEnd || newScheduleEnd < existingStart) {
        continue;
      } else {
        return {
          status: "ERROR",
          message: `Busboy ${
            schedule.busboy.name
          } is already assigned to another schedule from ${
            schedule.time_start
          } to ${String(Math.floor(existingEnd / 60)).padStart(
            2,
            "0"
          )}:${String(existingEnd % 60).padStart(2, "0")} on line ${
            schedule.line.name
          }.`,
        };
      }
    }

    for (const schedule of allScheduleDriver) {
      const existingStart = parseTime(schedule.time_start);
      const existingEnd = existingStart + schedule.line.time;

      // Nếu khoảng thời gian bị chồng lấn
      if (newScheduleStart > existingEnd || newScheduleEnd < existingStart) {
        continue;
      } else {
        return {
          status: "ERROR",
          message: `Driver ${
            schedule.driver.name
          } is already assigned to another schedule from ${
            schedule.time_start
          } to ${String(Math.floor(existingEnd / 60)).padStart(
            2,
            "0"
          )}:${String(existingEnd % 60).padStart(2, "0")} on line ${
            schedule.line.name
          }.`,
        };
      }
    }

    const schedules = await Schedule.find({}, { id: 1, _id: 0 }).sort({ id: 1 });
    const uniqueSchedules = Array.from(
      new Set(schedules.map((schedule) => schedule.id))
    );
    console.log("Unique Schedules:", uniqueSchedules);

    // Chuyển đổi sang số và sắp xếp
    const ids = uniqueSchedules.map((id) => parseInt(id.replace("S", ""), 10));
    ids.sort((a, b) => a - b);
    console.log("Sorted IDs:", ids);

    // Tìm ID mới
    let newIdNumber = 1;
    for (const id of ids) {
      if (id === newIdNumber) {
        newIdNumber++;
      } else {
        break;
      }
    }
    const newId = `S${String(newIdNumber).padStart(3, "0")}`;

    // const yesterday = new Date();
    // yesterday.setDate(yesterday.getDate() - 1); // Lùi lại 1 ngày

    const createdSchedule = await Schedule.create({
      id: newId,
      bus: data.bus,
      line: data.line,
      driver: data.driver,
      busboy: data.busboy,
      status: "Pending",
      time_start: data.time_start,
      time: data.time,
      // date: yesterday, // Ngày hôm qua
    });

    if (createdSchedule) {
      return {
        status: "OK",
        message: "Schedule created successfully.",
        data: createdSchedule,
      };
    }
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while creating the schedule.",
      error: e,
    };
  }
};

const getAllSchedule = async () => {
  try {
    const allSchedule = await Schedule.find()
      .populate("bus", "_id id license_plate status")
      .populate("line", "_id id name time")
      .populate("driver", "_id id name status")
      .populate("busboy", "_id id name status");

    const now = new Date();
    const offset = 7 * 60; // GMT+7 in minutes
    const localTime = new Date(now.getTime() + offset * 60 * 1000);
    const currentDate = localTime.toISOString().split("T")[0]; // Ngày hiện tại (YYYY-MM-DD)

    // Lấy danh sách các lịch trình đã tồn tại cho ngày hiện tại

    const startOfDay = new Date(currentDate); // Tạo một bản sao của currentDate
    startOfDay.setUTCHours(0, 0, 0, 0); // Đặt giờ, phút, giây, mili giây về 00:00:00

    const endOfDay = new Date(currentDate); // Tạo một bản sao khác của currentDate
    endOfDay.setUTCHours(23, 59, 59, 999); // Đặt giờ, phút, giây, mili giây về 23:59:59

    const existingSchedules = await Schedule.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    const existingScheduleIds = new Set(existingSchedules.map((sch) => sch.id));

    const newSchedules = [];

    allSchedule.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date).toISOString().split("T")[0]; // Ngày của schedule

      // Chỉ tạo mới nếu:
      // 1. Lịch trình thuộc ngày hôm qua hoặc trước đó.
      // 2. Lịch trình chưa tồn tại trong danh sách ngày hôm nay.
      if (scheduleDate < currentDate && !existingScheduleIds.has(schedule.id)) {
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
          date: localTime, // Ngày mới
        };

        newSchedules.push(newSchedule);
      }
    });

    // Thêm các schedule mới vào cơ sở dữ liệu
    if (newSchedules.length > 0) {
      await Schedule.insertMany(newSchedules);
    }
    // Cập nhật trạng thái cho các schedule hiện tại
    const currentTotalMinutes = localTime.getUTCHours() * 60 + localTime.getUTCMinutes();

    for (const schedule of allSchedule) {
      // Bỏ qua nếu trạng thái không phải "Not start yet" hoặc "In Progress"
      if (schedule.status !== "Not start yet" && schedule.status !== "In Progress") {
        continue;
      }
    
      const [startHours, startMinutes] = schedule.time_start.split(":").map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const finishTotalMinutes = startTotalMinutes + schedule.line.time;
    
      if (finishTotalMinutes <= currentTotalMinutes) {
        schedule.status = "Completed";
      } else if (startTotalMinutes <= currentTotalMinutes) {
        schedule.status = "In Progress";
      } else {
        schedule.status = "Not start yet";
      }
    
      try {
        await schedule.save();
      } catch (error) {
        console.error("Error saving schedule:", schedule.id, error);
      }
    }
    
    return {
      status: "OK",
      message: "Schedules retrieved and updated successfully.",
      data: allSchedule,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the schedules.",
      error: e,
    };
  }
};

const getAllAdd = async () => {
  try {
    const bus = await Bus.find({ status: "Active" }).select(
      "_id id license_plate"
    );
    const line = await Line.find().select("_id id name time");
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
    const checkSchedule = await Schedule.findOne({
      line: data.line,
      time_start: data.time_start,
    })
      .populate("line", "name")
      .populate("bus", "license_plate");
    if (checkSchedule) {
      return {
        status: "ERROR",
        message: `Schedule already exists on line ${checkSchedule.line.name} at ${checkSchedule.time_start} with bus ${checkSchedule.bus.license_plate}.`,
      };
    }

    const lineCheck = await Line.findById(data.line);

    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const newScheduleStart = parseTime(data.time_start);
    const newScheduleEnd = newScheduleStart + lineCheck.time;

    const allScheduleBusboy = await Schedule.find({
      busboy: data.busboy,
      _id: { $ne: data._id },
    })
      .populate("busboy", "name")
      .populate("line", "time name");

    const allScheduleDriver = await Schedule.find({
      driver: data.driver,
      _id: { $ne: data._id },
    })
      .populate("driver", "name")
      .populate("line", "time name");

    for (const schedule of allScheduleBusboy) {
      const existingStart = parseTime(schedule.time_start);
      const existingEnd = existingStart + schedule.line.time;

      if (newScheduleStart > existingEnd || newScheduleEnd < existingStart) {
        continue;
      } else {
        return {
          status: "ERROR",
          message: `Busboy ${
            schedule.busboy.name
          } is already assigned to another schedule from ${
            schedule.time_start
          } to ${String(Math.floor(existingEnd / 60)).padStart(
            2,
            "0"
          )}:${String(existingEnd % 60).padStart(2, "0")} on line ${
            schedule.line.name
          }.`,
        };
      }
    }

    for (const schedule of allScheduleDriver) {
      const existingStart = parseTime(schedule.time_start);
      const existingEnd = existingStart + schedule.line.time;

      // Nếu khoảng thời gian bị chồng lấn
      if (newScheduleStart > existingEnd || newScheduleEnd < existingStart) {
        continue;
      } else {
        return {
          status: "ERROR",
          message: `Driver ${
            schedule.driver.name
          } is already assigned to another schedule from ${
            schedule.time_start
          } to ${String(Math.floor(existingEnd / 60)).padStart(
            2,
            "0"
          )}:${String(existingEnd % 60).padStart(2, "0")} on line ${
            schedule.line.name
          }.`,
        };
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (!updatedSchedule) {
      return {
        status: "ERROR",
        message: "Failed to update the schedule or schedule not found.",
      };
    }
    return {
      status: "OK",
      message: "Schedule updated successfully.",
      data: updatedSchedule,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while updating the schedule.",
      error: e,
    };
  }
};

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

const deleteSchedule = async (ScheduleId) => {
  try {
    await Schedule.findByIdAndDelete(ScheduleId);
    return {
      status: "OK",
      message: "Schedule deleted successfully.",
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while deleting the schedule.",
      error: e,
    };
  }
};
const employeeCheckIn = async (data) => {
  try {
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
    const schedules = await Schedule.find({ date: { $gte: date } });
    schedules.forEach(async (schedule) => {
      schedule.status = "Not start yet";
      await schedule.save();
    });

    return {
      status: "OK",
      message: "Schedule updated successfully.",
      data: schedules,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while updating the schedule.",
      error: e,
    };
  }
};

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


