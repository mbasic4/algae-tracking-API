import dotenv from 'dotenv'
dotenv.config()
import bcrypt from 'bcrypt';

import sequelize from '../../db/config';
import User from '../../db/models/User';
import { generateToken } from "../../auth/jwtUtils";
import { BadRequestError, ConflictError } from '../../common/errors';
import Location from '../../db/models/Location';
import CitizenScientist from '../../db/models/CitizenScientist';

const saltRounds = 10;
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY

type RegisterCitizenScientistArgs = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userScope: "biologist" | "citizen-scientist";
  address: string;
}

async function registerCitizenScientist(
  { email, password, firstName, lastName, userScope, address }: RegisterCitizenScientistArgs
) {
  try {
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const response = await fetch(`https://api.tomtom.com/search/2/geocode/${address}.json?key=${TOMTOM_API_KEY}`)
    .catch(err => {
      throw new BadRequestError("Invalid address")
    })

    const locationData = await response.json()

    const location = { type: 'Point', coordinates: [locationData.results[0].position.lon, locationData.results[0].position.lat]}

    return sequelize.transaction(async tx => {
      const userExists = await User.findOne({
        where: { email },
        transaction: tx
      })

      if (userExists) {
        throw new ConflictError("Email already exists")
      }

      const createdUser = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        passwordHash
      }, {
        transaction: tx
      })

      const createdLocation = await Location.create({
        location: JSON.stringify(location)
      }, {
        transaction: tx
      })
        
      await CitizenScientist.create({
        userId: createdUser.id,
        locationId: createdLocation.id,
        address: address
      }, {
        transaction: tx
      })

      const token = generateToken({ user_id: createdUser.id, email: email, scope: userScope });

      return token
    })
  } catch (err) {
    err
  }
}

export default {
  registerCitizenScientist
}
