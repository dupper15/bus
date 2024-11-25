const ManagerRouter = require('./ManagerRouter')
const CustomerRouter = require('./CustomerRouter')
const BusRouter = require('./BusRouter')
const EmployeeRouter = require('./EmployeeRouter')
const OpinionRouter = require('./OpinionRouter')
const BillRouter = require('./MaintenanceBillRouter')
const StopRouter = require('./StopRouter')
const LineRouter = require('./LineRouter')
const ScheduleRouter = require('./ScheduleRouter')
const DayOffRouter = require('./DayOffRouter')
const Reward_PunishmentRouter = require('./Reward_PunishmentRouter')
const ImageRouter = require('./ImageRouter')

const routes = (app) => {
    app.use('/api/manager', (ManagerRouter))
    app.use('/api/customer', (CustomerRouter))
    app.use('/api/bus', (BusRouter))
    app.use('/api/employee', (EmployeeRouter))
    app.use('/api/opinion', (OpinionRouter))
    app.use('/api/bill', (BillRouter))
    app.use('/api/stop', (StopRouter))
    app.use('/api/line', (LineRouter))
    app.use('/api/schedule', (ScheduleRouter))
    app.use('/api/dayOff', (DayOffRouter))
    app.use('/api/reward_punishment', (Reward_PunishmentRouter))
    app.use('/api/image', (ImageRouter))
}

module.exports = routes