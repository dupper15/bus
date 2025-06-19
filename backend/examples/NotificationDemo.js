// Demo NgaÆn Gọn: Notification Decorator Pattern
// Minh họa cách sử dụng Decorator để thêm tính năng thông báo

const { BaseUser, NotificationDecorator } = require('../decorators/NotificationDecorator');
        
/**
 * Demo 1: Customer mua vé xe buýt
 */
function demoCustomer() {
    console.log('\n🎫 === DEMO CUSTOMER ===');
    
    const customerData = {
        id: 'CUS001',
        name: 'Nguyễn Văn A',
        userType: 'Customer'
    };
    
    // Tạo customer với notification
    const customer = new NotificationDecorator(
        new BaseUser(customerData), 
        { enable: true }
    );
    
    // Đăng nhập - tự động gửi thông báo chào mừng
    customer.login();
    
    // Mua vé - gửi thông báo xác nhận
    customer.performAction('buyTicket', {
            ticketType: '7days',
        price: 150000
    });
    
    // Xem lịch sử thông báo
    console.log('\nLịch sử thông báo:');
    customer.getNotifications().forEach((notif, i) => {
        console.log(`${i + 1}. ${notif.payload.message}`);
        });
}

/**
 * Demo 2: Employee báo cáo bảo trì
 */
function demoEmployee() {
    console.log('\n🔧 === DEMO EMPLOYEE ===');
    
    const employeeData = {
        id: 'EMP001',
        name: 'Trần Thị B',
        userType: 'Employee'
    };
    
    const employee = new NotificationDecorator(
        new BaseUser(employeeData)
    );
    
    employee.login();
        
    // Báo cáo bảo trì
    employee.performAction('reportMaintenance', {
            busId: 'BUS001',
        issue: 'Tiếng động bất thường'
        });
    
    console.log('\nThông báo đã gửi:');
    employee.getNotifications().forEach(notif => {
        console.log(`- ${notif.payload.message}`);
    });
}

/**
 * Demo 3: So sánh với và không có Decorator
 */
function demoComparison() {
    console.log('\n⚖️  === SO SÁNH VỚI VÀ KHÔNG CÓ DECORATOR ===');
    
    const userData = { id: 'USR001', name: 'Test User', userType: 'Customer' };
    
    // Không có decorator
    console.log('\n1. Không có Notification:');
    const basicUser = new BaseUser(userData);
    basicUser.login();
    basicUser.performAction('buyTicket', { price: 100000 });
    
    // Có decorator
    console.log('\n2. Có Notification Decorator:');
    const notificationUser = new NotificationDecorator(basicUser);
    notificationUser.login();
    notificationUser.performAction('buyTicket', { price: 100000 });
    
    console.log(`\nTổng thông báo đã gửi: ${notificationUser.getNotifications().length}`);
}

/**
 * Chạy tất cả demo
 */
function runDemo() {
    console.log('🚌 === NOTIFICATION DECORATOR PATTERN DEMO ===');
    
    demoCustomer();
    demoEmployee();
    demoComparison();
    
    console.log('\n✅ Demo hoàn thành!');
}

// Chạy demo
runDemo();

module.exports = { runDemo }; 