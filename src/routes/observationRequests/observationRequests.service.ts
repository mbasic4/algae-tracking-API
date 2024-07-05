import { NotAllowedError } from "../../common/errors"
import sequelize from "../../db/config"
import Biologist from "../../db/models/Biologist"
import Location from "../../db/models/Location"
import ObservationRequest from "../../db/models/ObservationRequest"

type CreateObservationRequestArgs = {
  userId: number;
  lat: number;
  lon: number;
  bodyOfWaterId: number;
}

async function createObservationRequest({ userId, lat, lon, bodyOfWaterId }: CreateObservationRequestArgs) {
  try {
    const location = { type: 'Point', coordinates: [lon, lat]}

    const observationRequest = await sequelize.transaction(async tx => {
      const biologist = await Biologist.findOne({
        where: { userId },
        transaction: tx
      })

      if (!biologist) {
        throw new NotAllowedError("User is not allowed to perform this action")
      }

      const createdLocation = await Location.create({
        location: JSON.stringify(location)
      }, {
        transaction: tx
      })
  
      return ObservationRequest.create({
        biologistId: biologist.id,
        bodyOfWaterId,
        locationId: createdLocation.id
      }, {
        transaction: tx
      })
    })

    return observationRequest
  } catch (err) {
    throw err
  }
}

async function listAllBiologistObservationRequests(userId: number) {
  try {
    const biologist = await Biologist.findOne({
      where: { userId }
    })

    if (!biologist) {
      throw new NotAllowedError("User is not allowed to perform this action")
    }

    const observationRequests = await ObservationRequest.findAll({
      where: { biologistId: biologist.id },
      include: {
        model: Location
      }
    })

    return observationRequests
  } catch (err) {
    throw err
  }
}

export default {
  createObservationRequest,
  listAllBiologistObservationRequests
}