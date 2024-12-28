const DashboardService = require("../services/DashboardService");
const getSumary = async (req, res) => {
  try {
    const response = await DashboardService.getSumary();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while retrieving the sumary.",
      error: e,
    });
  }
};
module.exports = {
  getSumary,
};
