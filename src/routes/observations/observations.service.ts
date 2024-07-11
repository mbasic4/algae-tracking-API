import Biologist from '../../db/models/Biologist'
import sequelize from '../../db/config'
import ObservationRequest from '../../db/models/ObservationRequest'
import Location from '../../db/models/Location'
import { validateToken } from '../../api'
import CitizenScientist from '../../db/models/CitizenScientist'
import Observation from '../../db/models/Observation'
import BodyOfWater from '../../db/models/BodyOfWater'
import { BadRequestError, NotAllowedError, NotFoundError } from '../../common/errors'

enum WaterColorEnum {
  GREEN = 'green',
  BLUE_GREEN = 'blue-green',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GOLDEN = 'golden',
  BROWN = 'brown'
};

type CreateObservationArgs = {
  observationRequestId: number;
  bodyOfWaterId: number;
  userId: number;
  waterColor: WaterColorEnum;
  secchiDepth: number;
  phosphorusConcentration: number;
  locationId?: number;
  lat: number;
  lon: number;
}

type UpdateObservationArgs = {
  observationId: number;
  waterColor: WaterColorEnum;
  secchiDepth: number;
  phosphorusConcentration: number;
  userId: number;
}

async function createObservation(
  { observationRequestId, bodyOfWaterId, userId, waterColor, secchiDepth, phosphorusConcentration, locationId, lat, lon }: CreateObservationArgs
) {
  try {
    if (!(waterColor || secchiDepth || phosphorusConcentration)) {
      throw new BadRequestError("At least one observation parameter is required")
    }

    const observation = await sequelize.transaction(async tx => {
      const citizenScientist = await CitizenScientist.findOne({
        //@ts-ignore
        where: { userId },
        transaction: tx
      })

      if (!citizenScientist) {
        throw new NotAllowedError("User is not allowed to perform this action")
      }

      if (waterColor && !Object.values(WaterColorEnum).includes(waterColor)) {
        throw Error("Invalid water color")
      }

      let finalLocationId = locationId

      if (!finalLocationId) {
        const location = { type: 'Point', coordinates: [lon, lat]}

        const createdLocation = await Location.create({
          location: JSON.stringify(location)
        }, {
          transaction: tx
        })

        finalLocationId = createdLocation.id
      }
  
      return Observation.create({
        waterColor: waterColor,
        secchiDepth: secchiDepth,
        phosphorusConcentration: phosphorusConcentration,
        citizenScientistId: citizenScientist.id,
        bodyOfWaterId: bodyOfWaterId,
        locationId: finalLocationId,
        observationRequestId: observationRequestId
      }, {
        transaction: tx
      })
    })

    return observation
  } catch (err) {
    throw err
  }
}

async function updateObservation(
  { observationId, waterColor, secchiDepth, phosphorusConcentration, userId }: UpdateObservationArgs
) {
  try {
    if (!(waterColor || secchiDepth || phosphorusConcentration)) {
      throw new BadRequestError("At least one observation parameter is required")
    }

    const updatedObservation = await sequelize.transaction(async tx => {
      const citizenScientist = await CitizenScientist.findOne({
        //@ts-ignore
        where: { userId },
        transaction: tx
      })

      if (!citizenScientist) {
        throw new NotAllowedError("User is not allowed to perform this action")
      }

      const observation = await Observation.findByPk(observationId)

      if (!observation) {
        throw new NotFoundError("This observation does not exist")
      }

      if (observation.citizenScientistId !== citizenScientist.id) {
        throw new NotAllowedError("User is not allowed to perform this action")
      }

      if (!Object.values(WaterColorEnum).includes(waterColor)) {
        throw Error("Invalid water color")
      }
  
      return Observation.update({
        waterColor: waterColor,
        secchiDepth: secchiDepth,
        phosphorusConcentration: phosphorusConcentration
      }, {
        where: {
          id: observationId
        },
        returning: true,
        transaction: tx
      })
    })

    return updatedObservation
  } catch (err) {
    throw err
  }
}

async function deleteObservation({ id, userId }:{ id: number, userId: number }) {
  try {
    return sequelize.transaction(async tx => {
      const citizenScientist = await CitizenScientist.findOne({
        //@ts-ignore
        where: { userId },
        transaction: tx
      })

      if (!citizenScientist) {
        throw new NotAllowedError("User is not allowed to perform this action")
      }

      const observation = await Observation.findByPk(id, { transaction: tx })

      if (!observation) {
        throw new NotFoundError("This observation does not exist")
      }

      if (observation.citizenScientistId !== citizenScientist.id) {
        throw new NotAllowedError("User is not allowed to perform this action")
      }
  
      return Observation.destroy({
        where: {
          id
        },
        transaction: tx
      })
    })
  } catch (err) {
    throw err
  }
}

async function listAllCitizenScientistObservations(userId: number) {
  try {
    const citizenScientist = await CitizenScientist.findOne({
      //@ts-ignore
      where: { userId }
    })

    if (!citizenScientist) {
      throw new NotAllowedError("User is not allowed to perform this action")
    }

    const observations = await Observation.findAll({
      where: { citizenScientistId: citizenScientist.id },
      include: [
        {
          model: Location
        },
        {
          model: BodyOfWater,
          attributes: ["id", "name", "geom"]
        },
        {
          model: ObservationRequest,
          include: [Biologist]
        }
      ]
    })

    return observations
  } catch (err) {
    throw err
  }
}

export default {
  createObservation,
  updateObservation,
  deleteObservation,
  listAllCitizenScientistObservations
}