import bcrypt from 'bcrypt';

import sequelize from '../../db/config';
import User from '../../db/models/User';
import Biologist from '../../db/models/Biologist';
import { generateToken } from "../../auth/jwtUtils";
import { ConflictError } from '../../common/errors';

const saltRounds = 10

type RegisterBiologistArgs = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userScope: "biologist" | "citizen-scientist";
}

async function registerBiologist(
  { email, password, firstName, lastName, userScope }: RegisterBiologistArgs
) {
  try {
    const passwordHash = await bcrypt.hash(password, saltRounds)

    return sequelize.transaction(async tx => {
      const userExists = await User.findOne({
        where: { email },
        transaction: tx
      })

      if (userExists) {
        throw new ConflictError("Email already exists")
      }

      const createdUser = await User.create({
        firstName,
        lastName,
        email,
        passwordHash
      }, {
        transaction: tx
      })
        
      await Biologist.create({
        userId: createdUser.id
      }, {
        transaction: tx
      })

      const token = generateToken({ user_id: createdUser.id, email: createdUser.email, scope: userScope });

      return token
    })
  } catch (err) {
    err
  }
}

export default {
  registerBiologist
}
