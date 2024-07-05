import express from "express";

import { validateToken } from "../../api";
import userService from "./user.service";
import { NotFoundError } from "../../common/errors";

export const userController = express.Router()

userController.get('/me', validateToken, async(req, res) => {
  try {
    //@ts-ignore
    const user = await userService.getUser({ userId: req.user.user_id, userScope: req.user.scope })

    res.send(user)
  } catch(err) {
    const statusCode = (err instanceof NotFoundError) ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
});