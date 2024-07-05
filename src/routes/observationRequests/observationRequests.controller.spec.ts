import request from "supertest"
import { api } from "../../api";
import { clearDB } from "../../testUtils/clearDb";
import User from "../../db/models/User";
import Location from "../../db/models/Location";
import Biologist from "../../db/models/Biologist";
import sequelize from "../../db/config";
import { generateToken } from "../../auth/jwtUtils";
import ObservationRequest from "../../db/models/ObservationRequest";

beforeEach(async () => {
  await clearDB();
  clearToken
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

describe('POST /observation-requests', () => {
  it('responds with json success', async () => {
    const { currentUser } = await createUser("biologist")

    const createdBiologist = await Biologist.create({
      userId: currentUser.id
    })

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const response = await request(api)
      .post('/observation-requests')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        biologistId: createdBiologist.id,
        //@ts-ignore
        bodyOfWaterId: rows[0].id,
        lat: 43.005,
        lon: -71.023
      })

    const location = await Location.findOne({
      where: {
        id: response.body.data.locationId
      }
    })

    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.data).toMatchObject({
      biologistId: createdBiologist.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: location?.id
    })
  });
});

describe('GET /observation-requests/me', () => {
  it('responds with json success', async () => {
    const { currentUser } = await createUser("biologist")

    const createdBiologist = await Biologist.create({
      userId: currentUser.id
    })

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation = await Location.create({
      location: JSON.stringify(location)
    })

    const observationRequest = await ObservationRequest.create({
      biologistId: createdBiologist.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: createdLocation.id
    })

    const response = await request(api)
      .get('/observation-requests/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(1)
    expect(response.body[0]).toMatchObject({
      biologistId: observationRequest.biologistId,
      bodyOfWaterId: observationRequest.bodyOfWaterId,
      locationId: observationRequest.locationId
    })
  })
})
