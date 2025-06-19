const nodemailer = require('nodemailer');

/**
 * Service để gửi email tập trung.
 * Sử dụng cấu hình từ environment variables.
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // Lấy từ .env
                pass: process.env.SMTP_PASS  // Lấy từ .env
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('📬 EmailService initialized');
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️  SMTP_USER or SMTP_PASS is not set in .env file. Email sending might fail.');
        }
    }

    /**
     * Gửi email
     * @param {string} to - Email người nhận
     * @param {string} subject - Tiêu đề email
     * @param {string} text - Nội dung dạng text
     * @param {string} html - Nội dung dạng HTML (optional)
     */
    async sendMail(to, subject, text, html = null) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Bus Management System" <${this.transporter.options.auth.user}>`,
                to: to,
                subject: subject,
                text: text,
                html: html || text // Dùng HTML nếu có, nếu không thì dùng text
            });

            console.log(`📨 Email sent successfully to ${to}. Message ID: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Error sending email to ${to}:`, error);
            return { success: false, error: error.message };
        }
    }
}

// Export một instance duy nhất (Singleton pattern)
module.exports = new EmailService(); 