import request from "supertest"

import { api } from "../../api";
import { clearDB } from "../../testUtils/clearDb";
import User from "../../db/models/User";
import Location from "../../db/models/Location";
import Biologist from "../../db/models/Biologist";
import sequelize from "../../db/config";
import CitizenScientist from "../../db/models/CitizenScientist";
import { generateToken } from "../../auth/jwtUtils";
import Observation from "../../db/models/Observation";

beforeEach(async () => {
  await clearDB()
  clearToken()
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

describe('GET /bodies_of_water/:id/observations', () => {
  it('responds with json success', async () => {
    const { currentUser } = await createUser('biologist')

    await Biologist.create({
      userId: currentUser.id
    });

    const observationCreator = await User.create({
      firstName: "Test",
      lastName: "Test2",
      email: "test2@gmail.com",
      passwordHash: "$2a$10$7S5sLHJFCbr62NUYFZhykuDI83f/YCoRhgr2dxpGWRGfxFM72nac."
    })

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation = await Location.create({
      location: JSON.stringify(location)
    })

    const createdCitizenScientist = await CitizenScientist.create({
      userId: observationCreator.id,
      locationId: createdLocation.id,
      address: "Test Address 12"
    });

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    //@ts-ignore
    const testBodyOfWaterId = rows[0].id

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    await Observation.create({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientist.id,
      //@ts-ignore
      bodyOfWaterId: testBodyOfWaterId,
      locationId: createdLocation.id
    })

    const response = await request(api)
      //@ts-ignore
      .get(`/bodies-of-water/${testBodyOfWaterId}/observations`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(1)
    expect(response.body[0]).toMatchObject({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientist.id,
      //@ts-ignore
      bodyOfWaterId: testBodyOfWaterId,
      locationId: createdLocation.id,
      observationRequestId: null
    })
  });

  it('responds with json success with empty rows if no observations exist for the body of water', async () => {
    const { currentUser } = await createUser('biologist')

    await Biologist.create({
      userId: currentUser.id
    });

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    //@ts-ignore
    const testBodyOfWaterId = rows[0].id

    const response = await request(api)
      .get(`/bodies-of-water/${testBodyOfWaterId}/observations`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(0)
  });

  it('responds with 403 for user that is not a biologist', async () => {
    const { currentUser } = await createUser('biologist')

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation = await Location.create({
      location: JSON.stringify(location)
    })

    await CitizenScientist.create({
      userId: currentUser.id,
      locationId: createdLocation.id,
      address: "Test Address 12"
    });

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    //@ts-ignore
    const testBodyOfWaterId = rows[0].id

    const response = await request(api)
      .get(`/bodies-of-water/${testBodyOfWaterId}/observations`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(403);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("User is not allowed to perform this action")
  });

  it('responds with 404 for a body of water that does not exist', async () => {
    const { currentUser } = await createUser('biologist')

    await Biologist.create({
      userId: currentUser.id
    })

    const nonExistingWaterId = 20;

    const response = await request(api)
      .get(`/bodies-of-water/${nonExistingWaterId}/observations`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(404);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("This body of water does not exist")
  });
});