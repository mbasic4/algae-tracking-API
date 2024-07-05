import { BadRequestError, NotAllowedError, NotFoundError } from "../../common/errors";
import sequelize from "../../db/config";
import Biologist from "../../db/models/Biologist";
import BodyOfWater from "../../db/models/BodyOfWater";
import Location from "../../db/models/Location";
import Observation from "../../db/models/Observation";
import ObservationRequest from "../../db/models/ObservationRequest";

type listNearestBodiesOfWaterArgs = {
  center: { lat?: string, lon?: string };
  includeRequests?: boolean;
  userScope: "biologist" | "citizen-scientist";
}

async function listNearestBodiesOfWater({center, includeRequests, userScope}: listNearestBodiesOfWaterArgs) {
  try {
    if(!(center.lat || center.lon)) {
      throw new BadRequestError("Latitude and longitute need to be defined")
    }

    const Point = sequelize.literal(`ST_GeomFromText('POINT(${center.lon} ${center.lat})', 4326)`);

    const data = await BodyOfWater.findAll({
      attributes: [
        "id",
        "name",
        "geom",
        [sequelize.fn('ST_Distance', sequelize.col('geom'), Point), 'distance']
      ],
      include: userScope === "citizen-scientist" && includeRequests
        ? [{
            model: ObservationRequest,
            as: "observationRequests",
            include: [Location]
          }]
        : [],
      order: sequelize.literal('distance ASC'),
      limit: 20
    })

    return data
  } catch (err) {
    throw(err)
  }
}

async function getBodyOfWaterObservations({ id, userId }: { id: number, userId: number }) {
  try {
    const biologist = await Biologist.findOne({
      where: { userId }
    })

    if (!biologist) {
      throw new NotAllowedError("User is not allowed to perform this action")
    }

    const bodyOfWater = await BodyOfWater.findByPk(id)

    if (!bodyOfWater) {
      throw new NotFoundError("This body of water does not exist")
    }

    const observations = await Observation.findAll({
      where: { bodyOfWaterId: id },
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
  listNearestBodiesOfWater,
  getBodyOfWaterObservations
}