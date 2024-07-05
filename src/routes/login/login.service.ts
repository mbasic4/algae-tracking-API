import bcrypt from 'bcrypt'

import User from '../../db/models/User';
import { generateToken } from "../../auth/jwtUtils";
import Biologist from '../../db/models/Biologist';
import { NotFoundError, UnauthorizedError } from '../../common/errors';

async function loginUser({ email, password }: { email: string, password: string }) {
  try {
    const user = await User.findOne({
      where: { email }
    })

    if (!user) {
      throw new NotFoundError("Email does not exist!")
    }

    const isBiologist = await Biologist.findOne({
      where: { userId: user.id }
    })

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if(passwordMatch) {
      const token = generateToken({ user_id: user.id, email, scope: isBiologist ? "biologist" : "citizen-scientist" });
      return token

    } else {
      throw new UnauthorizedError("Wrong password!")
    }
  } catch (err) {
    throw err
  }
}

export default {
  loginUser
}