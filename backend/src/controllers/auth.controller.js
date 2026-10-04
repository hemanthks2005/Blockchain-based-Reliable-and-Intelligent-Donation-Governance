import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, walletAddress } = req.body;
    const result = await authService.registerUser({
      name,
      email,
      password,
      role,
      walletAddress,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || 'REGISTRATION_ERROR',
          message: error.message,
        },
      });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || 'LOGIN_ERROR',
          message: error.message,
        },
      });
    }
    next(error);
  }
}

export function getMe(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}

export function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}
