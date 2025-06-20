const DayOffService = require("../services/states/DayOffService");
require("../services/OpinionService");
const createDayOff = async (req, res) => {
  try {
    const data = req.body;
    const response = await DayOffService.createDayOff(data);
    return res.status(201).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while creating the dayOff.",
      error: e,
    });
  }
};
const getNoCondition = async (req, res) => {
  try {
    const response = await DayOffService.getNoCondition();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while retrieving the dayOffs.",
      error: e,
    });
  }
};
const getDetailDayOff = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await DayOffService.getDetailDayOff(id);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while retrieving the dayOff details.",
      error: e,
    });
  }
};

const updateDayOff = async (req, res) => {
  try {
    const data = req.body;
    const response = await DayOffService.updateDayOff(data);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while updating the dayOff.",
    });
  }
};

const getAllDayOff = async (req, res) => {
  try {
    const response = await DayOffService.getAllDayOff();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while retrieving the dayOffs.",
      error: e,
    });
  }
};

const deleteDayOff = async (req, res) => {
  try {
    const DayOffId = req.params.id;
    if (!DayOffId) {
      return res.status(400).json({
        status: "ERROR",
        message: "DayOff ID is required.",
      });
    }
    const response = await DayOffService.deleteDayOff(DayOffId);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while deleting the dayOff.",
      error: e,
    });
  }
};

module.exports = {
  createDayOff,
  getDetailDayOff,
  updateDayOff,
  getAllDayOff,
  getNoCondition,
  deleteDayOff,
};
