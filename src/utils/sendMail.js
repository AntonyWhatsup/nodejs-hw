import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env;

// створюємо транспорт
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
 * Надсилає email з шаблону HTML.
 * @param {Object} options
 * @param {string} options.to - отримувач
 * @param {string} options.subject - тема листа
 * @param {string} options.templateName - назва html-шаблону (без .html)
 * @param {Object} options.templateData - дані для шаблону
 */
export const sendEmail = async ({ to, subject, templateName, templateData }) => {
  const templatePath = path.resolve(`src/templates/${templateName}.html`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const compiled = handlebars.compile(source);
  const html = compiled(templateData);

  const mailOptions = {
    from: SMTP_FROM,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};
