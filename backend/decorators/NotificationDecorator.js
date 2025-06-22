const EmailService = require('../services/EmailService');

/**
 * Base User Interface
 */
class UserInterface {
    constructor(userData) {
        this.userData = userData;
    }

    login() {
        throw new Error("Method must be implemented");
    }

    performAction(action, data) {
        throw new Error("Method must be implemented");
    }
}

/**
 * Concrete User Implementation
 */
class BaseUser extends UserInterface {
    constructor(userData) {
        super(userData);
        this.isLoggedIn = false;
    }

    login() {
        this.isLoggedIn = true;
        return {
            success: true,
            message: `${this.userData.name} đăng nhập thành công`,
            timestamp: new Date()
        };
    }

    performAction(action, data) {
        if (!this.isLoggedIn) {
            throw new Error("User phải đăng nhập trước");
        }
        
        return {
            success: true,
            action: action,
            data: data,
            performer: this.userData.name,
            timestamp: new Date()
        };
    }
}

/**
 * Base Decorator
 */
class UserDecorator extends UserInterface {
    constructor(user) {
        super(user.userData);
        this.user = user;
    }

    login() {
        return this.user.login();
    }

    performAction(action, data) {
        return this.user.performAction(action, data);
    }
}

class NotificationDecorator extends UserDecorator {
    constructor(user) {
        super(user);
        this.notificationHistory = [];
        
        // Map các action với handler tương ứng
        this.actionHandlers = {
            'buyTicket': this.handleBuyTicket.bind(this)
            // Thêm các action khác ở đây
        };
    }

    login() {
        const result = super.login();
        if (result.success) {
            this.sendNotification({
                type: 'LOGIN_SUCCESS',
                message: `Chào mừng ${this.userData.name} đã quay trở lại hệ thống.`
            });
        }
        return result;
    }

    performAction(action, data) {
        const result = super.performAction(action, data);
        
        // Gửi notification chung cho action
        const actionMessage = {
            'buyTicket': 'Mua vé thành công! Đang gửi email xác nhận...',
            'default': `Hành động '${action}' đã được thực hiện.`
        };
        this.sendNotification({
            type: `ACTION_${action.toUpperCase()}`,
            message: actionMessage[action] || actionMessage['default'],
            metadata: { action: action, success: result.success }
        });

        // Gọi handler riêng nếu có (để gửi mail, push noti,...)
        const handler = this.actionHandlers[action];
        if (handler) {
            // Sử dụng setTimeout để không block main flow
            setTimeout(async () => {
                try {
                    await handler(result);
                } catch (error) {
                    console.error('❌ Lỗi trong handler:', error.message);
                }
            }, 0);
        }

        return result;
    }

    /**
     * Handler cho action 'buyTicket' (gửi email)
     * @param {object} result - Kết quả từ performAction gốc
     */
    async handleBuyTicket(result) {
        const { data, performer, success } = result;
        const recipientEmail = this.user.userData.email || '22520734@gm.uit.edu.vn';

        if (!success || !recipientEmail) {
            console.warn('⚠️ Không thể gửi mail: action thất bại hoặc không có email người dùng.');
            return;
        }

        const subject = 'Xác nhận mua vé thành công';
        const text = `Chào ${performer},\n\nBạn đã mua vé thành công!\n\nChi tiết vé:\n- Mã vé: ${data.ticketId}\n- Giá: ${data.price} VND\n- Ngày hiệu lực: ${data.effectiveDate}\n\nCảm ơn bạn đã sử dụng dịch vụ.`;
        
        try {
            const emailResult = await EmailService.sendMail(recipientEmail, subject, text);
            if (emailResult.success) {
                console.log('✅ Email xác nhận đã được gửi thành công!');
            } else {
                console.error('❌ Lỗi gửi email:', emailResult.error);
            }
        } catch (error) {
            console.error('❌ Lỗi gửi email:', error.message);
        }
    }
    sendNotification({ type, message, metadata = {} }) {
        console.log(`[Notification] 📢 [${type}] ${message}`);

        const notification = {
            id: Date.now(),
            type: type,
            message: message,
            metadata: metadata,
            timestamp: new Date()
        };
        this.notificationHistory.push(notification);
    }

    getNotifications() {
        return this.notificationHistory;
    }
}

module.exports = {
    BaseUser,
    NotificationDecorator
}; 