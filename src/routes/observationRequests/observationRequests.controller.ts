import express from 'express'

import { validateToken } from '../../api'
import { NotAllowedError } from '../../common/errors'
import observationRequestsService from './observationRequests.service'

export const observationRequestsController = express.Router()

observationRequestsController.post('/observation-requests', validateToken, async (req, res) => {
  const observationRequestDTO = req.body

  try {
    const observationRequest = await observationRequestsService.createObservationRequest({
      //@ts-ignore
      userId: req.user.user_id,
      lat: observationRequestDTO.lat,
      lon: observationRequestDTO.lon,
      bodyOfWaterId: observationRequestDTO.bodyOfWaterId
    })

    return res.json({
      success: true,
      data: observationRequest
    });
  } catch (err) {
    const statusCode = err instanceof NotAllowedError ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
})

observationRequestsController.get('/observation-requests/me', validateToken, async (req, res) => {
  try {
    //@ts-ignore
    const observationRequests = await observationRequestsService.listAllBiologistObservationRequests(req.user.user_id)

    res.send(observationRequests)
  } catch(err) {
    const statusCode = err instanceof NotAllowedError ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
})
