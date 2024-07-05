import express from 'express';

import { BadRequestError, ConflictError } from '../../common/errors';
import registerCitizenScientistService from './registerCitizenScientist.service';


export const registerCitizenScientistController = express.Router();

registerCitizenScientistController.post('/signup/citizen-scientist', async (req, res) => {
  const userDTO = req.body;

  try {
    const token = await registerCitizenScientistService.registerCitizenScientist({ ...userDTO, userScope: "citizen-scientist" })

    return res.json({
      success: true,
      message: 'Authentication successful!',
      token: token,
    });
  } catch(err) {
    const statusCode = (err instanceof ConflictError || err instanceof BadRequestError) ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }

});
