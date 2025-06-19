// Service tích hợp NotificationDecorator với hệ thống User hiện tại
// Context: Bridge giữa MongoDB models và Notification system

const Customer = require('../models/CustomerModel');
const Employee = require('../models/EmployeeModel');
const Manager = require('../models/ManagerModel');

const {
    BaseUser,
    NotificationDecorator
} = require('../decorators/NotificationSystem');

/**
 * Service quản lý thông báo cho User
 */
class NotificationService {
    
    /**
     * Tạo User với NotificationDecorator từ database
     */
    static async createNotificationUser(userId, userType, notificationConfig = {}) {
        try {
            // Lấy user data từ database
            const userData = await this.getUserFromDatabase(userId, userType);
            
            if (!userData) {
                throw new Error(`User not found: ${userId}`);
            }
            
            // Tạo base user
            const baseUser = new BaseUser(userData);
            
            // Áp dụng default config theo user type
            const finalConfig = this.mergeWithDefaultConfig(userType, notificationConfig);
            
            // Wrap với NotificationDecorator
            return new NotificationDecorator(baseUser, finalConfig);
            
        } catch (error) {
            console.error('Error creating notification user:', error);
            throw error;
        }
    }
    
    /**
     * Lấy user data từ database
     */
    static async getUserFromDatabase(userId, userType) {
        let user = null;
        
        switch (userType.toLowerCase()) {
            case 'customer':
                user = await Customer.findOne({ id: userId });
                break;
            case 'employee':
                user = await Employee.findOne({ id: userId });
                break;
            case 'manager':
                user = await Manager.findOne({ id: userId });
                break;
            default:
                throw new Error(`Invalid user type: ${userType}`);
        }
        
        return user ? user.toObject() : null;
    }
    
    /**
     * Merge với default config theo user type
     */
    static mergeWithDefaultConfig(userType, customConfig) {
        const defaultConfigs = {
            customer: {
                enablePush: true,
                enableEmail: false,
                enableSMS: false,
                deviceTokens: []
            },
            employee: {
                enablePush: true,
                enableEmail: true,
                enableSMS: true, // SMS cho nhân viên để thông báo khẩn cấp
                deviceTokens: []
            },
            manager: {
                enablePush: true,
                enableEmail: true,
                enableSMS: true, // Manager cần nhận tất cả thông báo
                deviceTokens: []
            }
        };
        
        const defaultConfig = defaultConfigs[userType.toLowerCase()] || defaultConfigs.customer;
        return { ...defaultConfig, ...customConfig };
    }
    
    /**
     * Login user với notification
     */
    static async loginWithNotifications(username, password, clientInfo = {}) {
        try {
            // Tìm user trong database (giả lập)
            const userData = await this.findUserByUsername(username);
            
            if (!userData || userData.password !== password) {
                throw new Error('Invalid credentials');
            }
            
            // Tạo notification user
            const notificationUser = await this.createNotificationUser(
                userData.id,
                userData.userType,
                {
                    emailAddress: userData.username + '@email.com',
                    phoneNumber: userData.phone
                }
            );
            
            // Perform login
            const loginResult = notificationUser.login();
            
            return {
                success: true,
                user: notificationUser,
                loginResult,
                userData: userData
            };
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    /**
     * Giả lập tìm user by username
     */
    static async findUserByUsername(username) {
        // Trong thực tế sẽ query database
        // Đây là mock data cho demo
        const mockUsers = {
            'customer001': {
                id: 'CUS001',
                name: 'Nguyễn Văn A',
                userType: 'Customer',
                username: 'customer001',
                password: 'password123',
                phone: '0987654321'
            },
            'employee001': {
                id: 'EMP001',
                name: 'Trần Thị B',
                userType: 'Employee',
                username: 'employee001',
                password: 'password123',
                phone: '0123456789'
            },
            'manager001': {
                id: 'MGR001',
                name: 'Lê Văn C',
                userType: 'Manager',
                username: 'manager001',
                password: 'password123',
                phone: '0909090909'
            }
        };
        
        return mockUsers[username] || null;
    }
    
    /**
     * Perform action với notifications
     */
    static async performUserAction(notificationUser, action, data, context = {}) {
        try {
            return notificationUser.performAction(action, data);
        } catch (error) {
            console.error('Action error:', error);
            throw error;
        }
    }
    
    /**
     * Cập nhật notification settings
     */
    static async updateUserNotificationSettings(notificationUser, newSettings) {
        try {
            notificationUser.updateNotificationSettings(newSettings);
            
            // Trong thực tế có thể lưu settings vào database
            console.log('Notification settings updated successfully');
            
            return {
                success: true,
                message: 'Settings updated'
            };
            
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }
    
    /**
     * Lấy notification history
     */
    static getNotificationHistory(notificationUser, filter = {}) {
        try {
            return notificationUser.getNotifications(filter);
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }
    
    /**
     * Send notification tới user cụ thể
     */
    static async sendDirectNotification(userId, userType, notificationType, payload) {
        try {
            const notificationUser = await this.createNotificationUser(userId, userType);
            notificationUser.sendNotification(notificationType, payload);
            
            return {
                success: true,
                message: 'Notification sent'
            };
            
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }
    
    /**
     * Broadcast notification tới tất cả user của một type
     */
    static async broadcastNotification(userType, notificationType, payload) {
        try {
            // Trong thực tế sẽ query database để lấy tất cả user
            const users = await this.getAllUsersByType(userType);
            
            const results = [];
            for (const userData of users) {
                try {
                    const result = await this.sendDirectNotification(
                        userData.id,
                        userData.userType,
                        notificationType,
                        payload
                    );
                    results.push({
                        userId: userData.id,
                        success: true
                    });
                } catch (error) {
                    results.push({
                        userId: userData.id,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            return {
                success: true,
                results: results,
                totalSent: results.filter(r => r.success).length,
                totalFailed: results.filter(r => !r.success).length
            };
            
        } catch (error) {
            console.error('Error broadcasting notification:', error);
            throw error;
        }
    }
    
    /**
     * Mock function để lấy all users by type
     */
    static async getAllUsersByType(userType) {
        // Mock data - trong thực tế sẽ query database
        const mockData = {
            'Customer': [
                { id: 'CUS001', userType: 'Customer', name: 'Customer 1' },
                { id: 'CUS002', userType: 'Customer', name: 'Customer 2' }
            ],
            'Employee': [
                { id: 'EMP001', userType: 'Employee', name: 'Employee 1' },
                { id: 'EMP002', userType: 'Employee', name: 'Employee 2' }
            ],
            'Manager': [
                { id: 'MGR001', userType: 'Manager', name: 'Manager 1' }
            ]
        };
        
        return mockData[userType] || [];
    }
}

/**
 * Middleware để tự động attach notification capabilities
 */
class NotificationMiddleware {
    
    static async attachNotificationUser(req, res, next) {
        try {
            // Giả sử đã có thông tin user từ authentication middleware
            const userId = req.user?.id;
            const userType = req.user?.userType;
            
            if (!userId || !userType) {
                return next(); // Skip nếu không có user info
            }
            
            // Tạo notification user
            const notificationUser = await NotificationService.createNotificationUser(
                userId,
                userType,
                {
                    // Có thể lấy settings từ database
                    enablePush: true,
                    enableEmail: req.user.preferences?.enableEmail || false,
                    enableSMS: req.user.preferences?.enableSMS || false
                }
            );
            
            // Attach vào request
            req.notificationUser = notificationUser;
            
            next();
            
        } catch (error) {
            console.error('Notification middleware error:', error);
            // Không block request, chỉ log error
            next();
        }
    }
    
    static requireNotificationUser(req, res, next) {
        if (!req.notificationUser) {
            return res.status(401).json({
                error: 'Notification system not available',
                message: 'User notification capabilities not found'
            });
        }
        next();
    }
}

/**
 * Helper functions cho các routes
 */
class NotificationRoutes {
    
    /**
     * Route để thực hiện action với notification
     */
    static async performActionWithNotification(req, res) {
        try {
            const { action, data } = req.body;
            
            if (!req.notificationUser) {
                return res.status(400).json({
                    error: 'Notification user not found'
                });
            }
            
            const result = await NotificationService.performUserAction(
                req.notificationUser,
                action,
                data,
                {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }
            );
            
            res.json({
                success: true,
                result: result
            });
            
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }
    
    /**
     * Route để lấy notification history
     */
    static async getNotifications(req, res) {
        try {
            const filter = {
                type: req.query.type,
                unreadOnly: req.query.unread === 'true',
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined
            };
            
            const notifications = NotificationService.getNotificationHistory(
                req.notificationUser,
                filter
            );
            
            res.json({
                success: true,
                notifications: notifications,
                total: notifications.length
            });
            
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }
    
    /**
     * Route để cập nhật notification settings
     */
    static async updateSettings(req, res) {
        try {
            const settings = req.body;
            
            const result = await NotificationService.updateUserNotificationSettings(
                req.notificationUser,
                settings
            );
            
            res.json(result);
            
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }
}

module.exports = {
    NotificationService,
    NotificationMiddleware,
    NotificationRoutes
}; 