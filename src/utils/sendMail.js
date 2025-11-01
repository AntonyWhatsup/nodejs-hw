import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env;

// ✅ Створюємо транспорт для надсилання пошти
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

/**
 * Універсальна функція для надсилання електронних листів.
 * Приймає стандартні параметри nodemailer (to, subject, text, html, attachments тощо).
 *
 * @param {Object} options - параметри для nodemailer.sendMail
 * @returns {Promise<Object>} результат відправлення
 */
export const sendEmail = async (options) => {
  const mailOptions = {
    from: SMTP_FROM || SMTP_USER,
    ...options,
  };

  return transporter.sendMail(mailOptions);
};
