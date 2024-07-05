import express from 'express'

import { validateToken } from '../../api'
import { NotAllowedError, NotFoundError } from '../../common/errors'
import observationsService from './observations.service'

export const observationsController = express.Router()


observationsController.post('/observations', validateToken, async (req, res) => {
  const observationDTO = req.body

  try {
    const createdObservation = await observationsService.createObservation({
      ...observationDTO,
      //@ts-ignore
      userId: req.user.user_id
    })

    return res.json({
      success: true,
      data: createdObservation,
    });
  } catch (err) {
    const statusCode = err instanceof NotAllowedError ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
});

observationsController.put('/observations/:id', validateToken, async (req, res) => {
  const observationId = req.params.id
  const observationDTO = req.body

  try {
    const updatedObservation = await observationsService.updateObservation({
      ...observationDTO,
      observationId,
      //@ts-ignore
      userId: req.user.user_id
    })

    return res.json({
      success: true,
      data: updatedObservation,
    });
  } catch (err) {
    const statusCode = err instanceof NotAllowedError || err instanceof NotFoundError ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
});

observationsController.delete('/observations/:id', validateToken, async (req, res) => {
  try {
    const observationId = parseInt(req.params.id)

    //@ts-ignore
    await observationsService.deleteObservation({ id: observationId, userId: req.user.user_id })

    return res.status(200).json();
  } catch (err) {
    const statusCode = err instanceof NotAllowedError || err instanceof NotFoundError ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
});

observationsController.get('/observations/me', validateToken, async (req, res) => {
  try {
    //@ts-ignore
    const observations = await observationsService.listAllCitizenScientistObservations(req.user.user_id)

    res.send(observations)
  } catch(err) {
    const statusCode = err instanceof NotAllowedError || err instanceof NotFoundError ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
});
