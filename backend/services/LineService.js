const Line = require("../models/LineModel");
const Schedule = require("../models/ScheduleModel");
const LineDirector = require("./builder/LineDirector");
const LineDraftBuilder = require("./builder/LineDraftBuilder");
const LinePublishedBuilder = require("./builder/LinePublishedBuilder");
const createLine = (newLine) => {
  return new Promise(async (resolve, reject) => {
    const {
      type = "draft",
      name,
      start_place,
      end_place,
      time,
      arr_stop,
    } = newLine;

    // Validate type
    if (!["draft", "published"].includes(type)) {
      return reject({
        status: "ERROR",
        message: "Invalid line type. Must be 'draft' or 'published'.",
      });
    }

    try {
      const builder =
        type === "published"
          ? new LinePublishedBuilder()
          : new LineDraftBuilder();

      const director = new LineDirector(builder);

      // Dùng director để build
      const builtLine =
        type === "published"
          ? director.makePublishedLine({
              name,
              start_place,
              end_place,
              time,
              arr_stop,
            })
          : director.makeDraftLine({
              name,
              start_place,
              end_place,
              time,
              arr_stop,
            });

      // Lưu vào MongoDB
      const createdLine = await builtLine.save();

      resolve({
        status: "OK",
        message: "Line created successfully.",
        data: createdLine,
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: "An error occurred while creating the line.",
        error: e.message || e,
      });
    }
  });
};

const updateLine = (LineId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkLine = await Line.findOne({ _id: LineId });
      if (checkLine === null) {
        resolve({
          status: "ERROR",
          message: "No line found with the provided ID.",
        });
        return;
      }

      const updatedLine = await Line.findByIdAndUpdate(LineId, data, {
        new: true,
      });

      if (!updatedLine) {
        resolve({
          status: "ERROR",
          message: "Failed to update the line or line not found.",
        });
        return;
      }

      resolve({
        status: "OK",
        message: "Line updated successfully.",
        data: updatedLine,
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: "An error occurred while updating the line.",
        error: e,
      });
    }
  });
};

const getAllLine = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allLine = await Line.find()
        .populate("start_place")
        .populate("end_place")
        .populate("arr_stop");
      resolve({
        status: "OK",
        message: "Lines retrieved successfully.",
        data: allLine,
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: "An error occurred while retrieving the lines.",
        error: e,
      });
    }
  });
};

const getDetailLine = (LineId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const line = await Line.findOne({ _id: LineId })
        .populate("start_place")
        .populate("end_place")
        .populate("arr_stop");
      if (line === null) {
        resolve({
          status: "ERROR",
          message: "No line found with the provided ID.",
        });
        return;
      }
      resolve({
        status: "OK",
        message: "Line details retrieved successfully.",
        data: line,
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: "An error occurred while retrieving the line details.",
        error: e,
      });
    }
  });
};

const deleteLine = (LineId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const line = await Line.findOne({
        _id: LineId,
      });
      if (line === null) {
        resolve({
          status: "ERROR",
          message: "No line found with the provided ID.",
        });
        return;
      }

      await Line.findByIdAndDelete(LineId);
      resolve({
        status: "OK",
        message: "Line deleted successfully.",
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: "An error occurred while deleting the line.",
        error: e,
      });
    }
  });
};

const getAllSchedule = async (LineId) => {
  try {
    const schedules = await Schedule.find({ line: LineId });

    if (!schedules || schedules.length === 0) {
      return {
        status: "ERROR",
        message: "No schedules found.",
        data: [],
      };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const todayDate = now.toISOString().split("T")[0];

    const timesWithStatus = schedules
      .map((schedule) => {
        if (schedule.date.toISOString().split("T")[0] === todayDate) {
          const [hour, minute] = schedule.time_start.split(":").map(Number);
          const scheduleTime = new Date(now.getTime());
          scheduleTime.setHours(hour, minute, 0, 0);

          const timeInMinutes = hour * 60 + minute;

          return {
            time: schedule.time_start,
            status: timeInMinutes > currentTimeInMinutes ? 1 : 0,
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    if (timesWithStatus.length === 0) {
      return {
        status: "ERROR",
        message: "No schedules found for today.",
        data: [],
      };
    }

    const sortedTimesWithStatus = timesWithStatus.sort((a, b) => {
      const [hourA, minuteA] = a.time.split(":").map(Number);
      const [hourB, minuteB] = b.time.split(":").map(Number);

      return hourA * 60 + minuteA - (hourB * 60 + minuteB);
    });

    return {
      status: "OK",
      message: "Line details retrieved successfully.",
      data: sortedTimesWithStatus,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the line details.",
      error: e.message,
    };
  }
};

module.exports = {
  createLine,
  updateLine,
  getAllLine,
  getDetailLine,
  deleteLine,
  getAllSchedule,
};
