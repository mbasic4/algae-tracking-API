import express from 'express'

import { NotFoundError, UnauthorizedError } from '../../common/errors';
import loginService from './login.service';

export const loginController = express.Router()

loginController.post('/login', async (req, res) => {
  const userDTO = req.body;

  try {
    const token = await loginService.loginUser({ email: userDTO.email, password: userDTO.password })

    return res.json({
      success: true,
      message: 'Authentication successful!',
      token: token,
    });
  } catch(err) {
    const statusCode = (err instanceof UnauthorizedError || err instanceof NotFoundError) ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }

});
