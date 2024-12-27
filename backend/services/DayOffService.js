const DayOff = require("../models/DayOffModel");

const createDayOff = async (data) => {
  try {
    const dayOffs = await DayOff.find({}, { id: 1, _id: 0 }).sort({ id: 1 });
    const ids = dayOffs.map((dayOff) =>
      parseInt(dayOff.id.replace("R", ""), 10)
    );

    let newIdNumber = 1;
    for (const id of ids) {
      if (id === newIdNumber) {
        newIdNumber++;
      } else {
        break;
      }
    }
    const newId = `R${String(newIdNumber).padStart(3, "0")}`;

    const createdDayOff = await DayOff.create({
      id: newId,
      employee: data._id,
      title: data.title,
      content: data.content,
      date_requested: new Date(),
    });

    return {
      status: "OK",
      message: "Request leave created successfully.",
      data: createdDayOff,
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: "An error occurred while creating the DayOff.",
      error,
    };
  }
};

const getAllDayOff = async () => {
  try {
    const allDayOff = await DayOff.find({ status: "Pending" })
      .populate("employee")
      .populate("manager");
    return {
      status: "OK",
      message: "Pending DayOffs retrieved successfully.",
      data: allDayOff,
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the Pending DayOffs.",
      error,
    };
  }
};

const updateDayOff = async (data) => {
  try {
    const checkDayOff = await DayOff.findOne({ id: data.id });
    if (checkDayOff === null) {
      return {
        status: "ERROR",
        message: "No request leave found with the provided ID.",
      };
    }
    const updatedDayOff = await DayOff.findByIdAndUpdate(
      checkDayOff._id,
      {
        manager: data._id,
        status: data.status,
        feedback: data.feedback,
        date_solved: new Date(),
      },
      { new: true }
    );
    if (!updatedDayOff) {
      return {
        status: "ERROR",
        message: "Failed to update the DayOff or DayOff not found.",
      };
    }
    return {
      status: "OK",
      message: "Resolved request leave successfully.",
      data: updatedDayOff,
    };
  } catch (error) {
    // Xử lý lỗi và trả về phản hồi lỗi
    return {
      status: "ERROR",
      message: "An error occurred while updating the DayOff.",
      error,
    };
  }
};

const getDetailDayOff = async (id) => {
  try {
    const checkDayOff = await DayOff.find({
      employee: id,
    }).populate("manager");
    if (!checkDayOff) {
      return {
        status: "ERROR",
        message: "No dayOff found for the provided employee ID.",
      };
    }
    return {
      status: "OK",
      message: "DayOff details retrieved successfully.",
      data: checkDayOff,
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the DayOff details.",
      error,
    };
  }
};

const deleteDayOff = (DayOffId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dayOff = await DayOff.findOne({
        _id: DayOffId,
      });
      if (dayOff === null) {
        resolve({
          status: "ERROR",
          message: "No dayOff found with the provided ID.",
        });
        return;
      }

      await DayOff.findByIdAndDelete(DayOffId);
      resolve({
        status: "OK",
        message: "DayOff deleted successfully.",
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: "An error occurred while deleting the dayOff.",
        error: e,
      });
    }
  });
};

module.exports = {
  createDayOff,
  getAllDayOff,
  updateDayOff,
  getDetailDayOff,
  deleteDayOff,
};
