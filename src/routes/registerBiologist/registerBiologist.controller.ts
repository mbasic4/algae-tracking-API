import express from 'express';

import { ConflictError } from '../../common/errors';
import registerBiologistService from './registerBiologist.service';


export const registerBiologistController = express.Router()

registerBiologistController.post('/signup/biologist', async (req, res) => {
  const userDTO = req.body;

  try {
    const token = await registerBiologistService.registerBiologist({ ...userDTO, userScope: "biologist" })

    return res.json({
      success: true,
      message: 'Authentication successful!',
      token: token,
    });
  } catch(err) {
    const statusCode = (err instanceof ConflictError) ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
});
