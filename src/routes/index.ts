import express from 'express'

import "../db/models/associations"
import { registerBiologistController } from './registerBiologist/registerBiologist.controller'
import { registerCitizenScientistController } from './registerCitizenScientist/registerCitizenScientist.controller'
import { loginController } from './login/login.controller'
import { userController } from './user/user.controller'
import { bodiesOfWaterController } from './bodiesOfWater/bodiesOfWater.controller'
import { observationRequestsController } from './observationRequests/observationRequests.controller'
import { observationsController } from './observations/observations.controller'

export const apiController = express.Router()
apiController.use([
  registerBiologistController,
  registerCitizenScientistController,
  loginController,
  userController,
  bodiesOfWaterController,
  observationRequestsController,
  observationsController
])
