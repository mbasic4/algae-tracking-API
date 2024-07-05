import express from 'express'

import bodiesOfWaterService from './bodiesOfWater.service'
import { validateToken } from '../../api'
import { BadRequestError, NotAllowedError, NotFoundError } from '../../common/errors'

export const bodiesOfWaterController = express.Router()

bodiesOfWaterController.get('/bodies-of-water', validateToken, async (req, res) => {
  try {
    /* const Point = sequelize.literal(`ST_GeomFromText('POINT(${req.query.lon} ${req.query.lat})', 4326)`);

    const data = await BodyOfWater.findAll({
      attributes: [
        "id",
        "name",
        "geom",
        [sequelize.fn('ST_Distance', sequelize.col('geom'), Point), 'distance']
      ],
      //@ts-ignore
      include: req.user.scope === "citizen-scientist" && req.query.includeRequests
        ? [{
            model: ObservationRequest,
            as: "observationRequests",
            include: [Location]
          }]
        : [],
      order: sequelize.literal('distance ASC'),
      limit: 20
    }) */
    // we're sending these programmatically so we epxect string type
    const lat = req.query.lat as string | undefined
    const lon = req.query.lon as string | undefined

    const data = await bodiesOfWaterService.listNearestBodiesOfWater({
      center: { lat, lon },
      includeRequests: req.query.includeRequests === "true",
      //@ts-ignore
      userScope: req.user.scope
    })

    res.send(data)
  } catch (err) {
    const statusCode = (err instanceof BadRequestError) ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
})

bodiesOfWaterController.get('/bodies-of-water/:id/observations', validateToken, async (req, res) => {
  try {
    const observations = await bodiesOfWaterService.getBodyOfWaterObservations({
      id: parseInt(req.params.id),
      //@ts-ignore
      userId: req.user.user_id
    })

    res.send(observations)
  } catch(err) {
    const statusCode = err instanceof NotAllowedError || err instanceof NotFoundError ? err.statusCode : 400
    return res.status(statusCode).json({
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong!"
    })
  }
});
