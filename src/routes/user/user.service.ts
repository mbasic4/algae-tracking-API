import { NotFoundError } from "../../common/errors"
import Biologist from "../../db/models/Biologist"
import CitizenScientist from "../../db/models/CitizenScientist"
import Location from "../../db/models/Location"
import User from "../../db/models/User"


async function getUser({ userId, userScope }: { userId: number, userScope: "biologist" | "citizen-scientist" }) {
  try {
    const user = await User.findByPk(userId, {
      attributes: {exclude: ['passwordHash']},
      //@ts-ignore
      include:
        userScope === "citizen-scientist"
        ? [{
          model: CitizenScientist,
          as: "citizenScientist",
          include: [{
            model: Location
          }]
        }]
        : [Biologist]
    })

    if (!user) {
      throw new NotFoundError("User does not exist")
    }

    return user
  } catch (err) {
    throw err
  }
}

export default {
  getUser
}
