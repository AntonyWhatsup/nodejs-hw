import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

const router = Router();

// 🔐 Реєстрація користувача
router.post('/auth/register', celebrate(registerUserSchema), registerUser);

// 🔑 Вхід користувача
router.post('/auth/login', celebrate(loginUserSchema), loginUser);

// 🚪 Вихід користувача
router.post('/auth/logout', logoutUser);

// 🔄 Оновлення сесії користувача
router.post('/auth/refresh', refreshUserSession);

// ✉️ Надіслати лист для скидання пароля
router.post('/auth/request-reset-email', celebrate(requestResetEmailSchema), requestResetEmail);

// 🔁 Скидання пароля
router.post('/auth/reset-password', celebrate(resetPasswordSchema), resetPassword);

export default router;
