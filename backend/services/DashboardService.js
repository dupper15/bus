const Employee = require("../models/EmployeeModel");
const Bus = require("../models/BusModel");
const DayOff = require("../models/DayOffModel");
const Opinion = require("../models/OpinionModel");
const Schedule = require("../models/ScheduleModel");
const Ticket = require("../models/TicketModel");
const Bill = require("../models/MaintenanceBillModel")
const Line = require("../models/LineModel")

const getSumary = async () => {
  try {
    const [employees, buses, dayOffs, opinions] = await Promise.all([
      Employee.find(),
      Bus.find(),
      DayOff.find({ status: "Pending" }),
      Opinion.find(),
    ]);
    const totalEmployees = employees.length;
    const totalBus = buses.length;
    const totalDayOffs = dayOffs.length;
    const totalOpinions = opinions.length;
    return {
      status: "OK",
      message: "Summary data retrieved successfully.",
      data: { totalEmployees, totalBus, totalDayOffs, totalOpinions },
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the summary data.",
      error: e.message,
    };
  }
};

const getRevenue = async () => {
  try {
    const now = new Date(); // Ngày hiện tại
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const schedules = await Schedule.find({date: { $gte: threeMonthsAgo, $lte: now }});
    const tickets = await Ticket.find({effective_date: { $gte: threeMonthsAgo, $lte: now }});
    const bills  = await Bill.find({start_date: { $gte: threeMonthsAgo, $lte: now }});

    const dates = [];
    for (let d = new Date(threeMonthsAgo); d <= now; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]); // Chỉ lấy ngày
    }

    // Tính doanh thu theo ngày cho Schedule
    const scheduleRevenueByDate = {};
    schedules.forEach((item) => {
      const dateOnly = new Date(item.date).toISOString().split("T")[0];
      const revenue = (item.ticket3 || 0) * 3000 + (item.ticket7 || 0) * 7000;
      if (!scheduleRevenueByDate[dateOnly]) scheduleRevenueByDate[dateOnly] = 0;
      scheduleRevenueByDate[dateOnly] += revenue;
    });

    // Tính doanh thu theo ngày cho Ticket
    const ticketRevenueByDate = {};
    tickets.forEach((item) => {
      const dateOnly = new Date(item.effective_date).toISOString().split("T")[0];
      const revenue = item.price || 0;
      if (!ticketRevenueByDate[dateOnly]) ticketRevenueByDate[dateOnly] = 0;
      ticketRevenueByDate[dateOnly] += revenue;
    });

    // Tính doanh thu theo ngày cho Bill
    const billRevenueByDate = {};
    bills.forEach((item) => {
      const dateOnly = new Date(item.start_date).toISOString().split("T")[0];
      const revenue = parseFloat(item.price) || 0;
      if (!billRevenueByDate[dateOnly]) billRevenueByDate[dateOnly] = 0;
      billRevenueByDate[dateOnly] += revenue;
    });

    // Gắn doanh thu vào từng ngày, nếu không có dữ liệu thì doanh thu là 0
    const revenues = dates.map((date) => ({
      date,
      revenue: (scheduleRevenueByDate[date] || 0) + (ticketRevenueByDate[date] || 0),
      cost: billRevenueByDate[date] || 0,
      profit:
        (scheduleRevenueByDate[date] || 0) +
        (ticketRevenueByDate[date] || 0) -
        (billRevenueByDate[date] || 0),
    }));
    
    return {
      status: "OK",
      message: "Summary data retrieved successfully.",
      data: revenues
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the summary data.",
      error: e.message,
    };
  }
};

const getLine = async () => {
  try {
    const now = new Date(); // Ngày hiện tại
    const oneMonthAgo = new Date(now); // Tháng trước
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    // Lấy tất cả schedules trong 3 tháng qua
    const schedules = await Schedule.find({ 
      date: { $gte: oneMonthAgo, $lte: now }
    });
    
    // Lấy tất cả line
    const lines = await Line.find();

    // Khởi tạo đối tượng lineTicketCounts với dữ liệu cho từng tháng
    const lineTicketCounts = [
      {
        month: now.getMonth() + 1,  // Tháng hiện tại, cộng 1
        lineData: lines.map(line => ({
          lineId: line._id,
          lineName: line.name,
          visitors: 0
        })),
        totalVisitors: 0,
      },
      {
        month: oneMonthAgo.getMonth(),  // Tháng trước, cộng 1
        lineData: lines.map(line => ({
          lineId: line._id,
          lineName: line.name,
          visitors: 0
        })),
        totalVisitors: 0,
      },
    ];

    // Duyệt qua các schedules để tính tổng số visitors (ticket3 + ticket7) theo line và tháng
    schedules.forEach(item => {
      const date = new Date(item.date);
      const lineIndex = lineTicketCounts.findIndex(month => month.month === date.getMonth() + 1);

      if (lineIndex !== -1) {
        const lineIndexInMonth = lineTicketCounts[lineIndex].lineData.findIndex(line => line.lineId.toString() === item.line._id.toString());
        if (lineIndexInMonth !== -1) {
          const visitors = item.ticket3 + item.ticket7 || 0;
          lineTicketCounts[lineIndex].lineData[lineIndexInMonth].visitors += visitors;
          lineTicketCounts[lineIndex].totalVisitors += visitors;
        }
      }
    });

    // Tạo dữ liệu kết quả theo yêu cầu
    const result = lineTicketCounts.map(month => ({
      month: month.month,
      lineData: month.lineData,
      totalVisitors: month.totalVisitors
    }));

    return {
      status: "OK",
      message: "Summary data retrieved successfully.",
      data: result
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the summary data.",
      error: e.message,
    };
  }
};

const getBus = async () => {
  try {
    const now = new Date(); // Ngày hiện tại
    const oneMonthAgo = new Date(now); // Tháng trước
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    // Lấy tất cả schedules trong 3 tháng qua
    const schedules = await Schedule.find({ 
      date: { $gte: oneMonthAgo, $lte: now }, status: "Completed"
    });

    // Lấy tất cả line
    const buses = await Bus.find();

    // Khởi tạo đối tượng lineTicketCounts với dữ liệu cho từng tháng
    const busCounts = [
      {
        month: now.getMonth() + 1,  // Tháng hiện tại, cộng 1
        busData: buses.map(bus => ({
          busId: bus._id,
          license_plate: bus.license_plate,
          total: 0
        })),
        totalTrip: 0,
      },
      {
        month: oneMonthAgo.getMonth(),  // Tháng trước, cộng 1
        busData: buses.map(bus => ({
          busId: bus._id,
          license_plate: bus.license_plate,
          total: 0
        })),
        totalTrip: 0,
      },
    ];

    schedules.forEach(item => {
      const date = new Date(item.date);
      const busIndex = busCounts.findIndex(month => month.month === date.getMonth() + 1);

      if (busIndex !== -1) {
        const busIndexInMonth = busCounts[busIndex].busData.findIndex(bus => bus.busId.toString() === item.bus._id.toString());
        if (busIndexInMonth !== -1) {
          busCounts[busIndex].busData[busIndexInMonth].total += 1;
          busCounts[busIndex].totalTrip += 1;
        }
      }
    });
    
    return {
      status: "OK",
      message: "Summary data retrieved successfully.",
      data: busCounts
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the summary data.",
      error: e.message,
    };
  }
};

module.exports = {
  getSumary,
  getRevenue,
  getLine,
  getBus
};
