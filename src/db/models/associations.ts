import Biologist from "./Biologist"
import BodyOfWater from "./BodyOfWater"
import CitizenScientist from "./CitizenScientist"
import Location from "./Location"
import Observation from "./Observation"
import ObservationRequest from "./ObservationRequest"
import User from "./User"

User.hasOne(Biologist)
Biologist.belongsTo(User, { foreignKey: "userId" })

User.hasOne(CitizenScientist, { as: "citizenScientist", foreignKey: "userId" })
CitizenScientist.belongsTo(User)

Location.hasOne(CitizenScientist)
CitizenScientist.belongsTo(Location, { foreignKey: "locationId" })

BodyOfWater.hasMany(ObservationRequest, { as: "observationRequests", foreignKey: "bodyOfWaterId" })
ObservationRequest.belongsTo(BodyOfWater, { foreignKey: "bodyOfWaterId" })

Biologist.hasMany(ObservationRequest)
ObservationRequest.belongsTo(Biologist, { foreignKey: "biologistId" })

Location.hasOne(ObservationRequest)
ObservationRequest.belongsTo(Location, { foreignKey: "locationId" })

CitizenScientist.hasMany(Observation)
Observation.belongsTo(CitizenScientist, { foreignKey: "citizenScientistId" })

Location.hasOne(Observation)
Observation.belongsTo(Location, { foreignKey: "locationId" })

BodyOfWater.hasMany(Observation, { foreignKey: "bodyOfWaterId" })
Observation.belongsTo(BodyOfWater, { foreignKey: "bodyOfWaterId" })

ObservationRequest.hasMany(Observation)
Observation.belongsTo(ObservationRequest, { foreignKey: "observationRequestId" })
