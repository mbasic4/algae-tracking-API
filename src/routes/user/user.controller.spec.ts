import request from "supertest"
import { api } from "../../api";
import { clearDB } from "../../testUtils/clearDb";
import User from "../../db/models/User";
import { generateToken } from "../../auth/jwtUtils";
import Location from "../../db/models/Location";
import CitizenScientist from "../../db/models/CitizenScientist";
import Biologist from "../../db/models/Biologist";

beforeEach(async () => {
  await clearDB();
  clearToken();
});

let token: string | null;

const clearToken = () => {
  token = null
}

const createUser = async (scope: 'biologist' | 'citizen-scientist') => {
  const createdUser = await User.create({
    firstName: "Test",
    lastName: "Test",
    email: "test@gmail.com",
    passwordHash: "$2a$10$7S5sLHJFCbr62NUYFZhykuDI83f/YCoRhgr2dxpGWRGfxFM72nac."
  })

  token = generateToken({ user_id: createdUser.id, email: createdUser.email, scope });

  return { currentUser: createdUser }
}

describe('GET /me', function() {
  it('responds with json success for citizen-scientist user', async () => {
    const { currentUser } = await createUser('citizen-scientist')

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation = await Location.create({
      location: JSON.stringify(location)
    })

    const createdCitizenScientist = await CitizenScientist.create({
      userId: currentUser.id,
      locationId: createdLocation.id,
      address: "Test Address 12"
    });

    const response = await request(api)
      .get('/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      citizenScientist: {
        id: createdCitizenScientist.id,
        userId: currentUser.id,
        locationId: createdCitizenScientist.locationId,
        address: createdCitizenScientist.address
      }
    })
  });

  it('responds with json success for biologist user', async () => {
    const { currentUser } = await createUser('biologist')

    const createdBiologist = await Biologist.create({
      userId: currentUser.id
    });

    const response = await request(api)
      .get('/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      biologist: {
        id: createdBiologist.id,
        userId: currentUser.id
      }
    })
  });

  it('responds with 404 when user is not found', async () => {
    const testToken = generateToken({ user_id: 2, email: "test2@gmail.com", scope: "citizen-scientist" })

    const response = await request(api)
      .get('/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testToken}`)

    expect(response.status).toEqual(404);
    expect(response.body.message).toMatch("User does not exist")
  });
});