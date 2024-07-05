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

describe('POST /observations', () => {
  it('responds with json success', async () => {
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

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    const response = await request(api)
      .post('/observations')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        waterColor,
        secchiDepth,
        phosphorusConcentration,
        citizenScientistId: createdCitizenScientist.id,
        //@ts-ignore
        bodyOfWaterId: rows[0].id,
        lat: 43.005,
        lon: -71.023
      })

    const observationLocation = await Location.findOne({
      where: {
        id: response.body.data.locationId
      }
    })

    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.data).toMatchObject({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientist.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: observationLocation?.id,
      observationRequestId: null
    })
  });

  it('responds with 400 when no observation parameters are provided', async () => {
    await createUser('citizen-scientist')

    const response = await request(api)
      .post('/observations')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toEqual(400);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("At least one observation parameter is required")
  });

  it('responds with 403 for user that is not a citizen scientist', async () => {
    const { currentUser } = await createUser('biologist')

    const createdBiologist = await Biologist.create({
      userId: currentUser.id
    });

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    const response = await request(api)
      .post('/observations')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        waterColor,
        secchiDepth,
        phosphorusConcentration,
        citizenScientistId: createdBiologist.id,
        //@ts-ignore
        bodyOfWaterId: rows[0].id,
        lat: 43.005,
        lon: -71.023
      })

    expect(response.status).toEqual(403);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("User is not allowed to perform this action")
  });

  it('responds with 400 if water color is not valid', async () => {
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

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'gibberish'

    const response = await request(api)
      .post('/observations')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        waterColor,
        citizenScientistId: createdCitizenScientist.id,
        //@ts-ignore
        bodyOfWaterId: rows[0].id,
        lat: 43.005,
        lon: -71.023
      })

    expect(response.status).toEqual(400);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("Invalid water color")
  });
});

describe('PUT /observations:id', () => {
  it('responds with json success', async () => {
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

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    const createdObservation = await Observation.create({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientist.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: createdLocation.id
    })

    const response = await request(api)
      .put(`/observations/${createdObservation.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        waterColor: 'red',
        secchiDepth: 20,
        phosphorusConcentration: 50,
      })

    const [rowsUpdated, [updatedObservation]] = response.body.data

    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(rowsUpdated).toEqual(1)
    expect(updatedObservation).toMatchObject({
      waterColor: 'red',
      secchiDepth: 20,
      phosphorusConcentration: 50,
      citizenScientistId: createdCitizenScientist.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: createdLocation.id,
      observationRequestId: null
    })
  });

  it('responds with 400 when no observation parameters are provided', async () => {
    await createUser('citizen-scientist')

    const response = await request(api)
      .put('/observations/1')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toEqual(400);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("At least one observation parameter is required")
  });

  it('responds with 403 for user that did not create the observation', async () => {
    const { currentUser } = await createUser('citizen-scientist')
    const observationCreator = await User.create({
      firstName: "Test",
      lastName: "Test2",
      email: "test2@gmail.com",
      passwordHash: "$2a$10$7S5sLHJFCbr62NUYFZhykuDI83f/YCoRhgr2dxpGWRGfxFM72nac."
    })

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation1 = await Location.create({
      location: JSON.stringify(location)
    })

    await CitizenScientist.create({
      userId: currentUser.id,
      locationId: createdLocation1.id,
      address: "Test Address 12"
    });

    const createdLocation2 = await Location.create({
      location: JSON.stringify(location)
    })

    const createdCitizenScientistObservator = await CitizenScientist.create({
      userId: observationCreator.id,
      locationId: createdLocation2.id,
      address: "Test Address 12"
    });

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    const measurementLocation = { type: 'Point', coordinates: [22.22, 44.24]}

    const measurementCreatedLocation = await Location.create({
      location: JSON.stringify(measurementLocation)
    })


    const createdObservation = await Observation.create({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientistObservator.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: measurementCreatedLocation.id
    })


    const response = await request(api)
      .put(`/observations/${createdObservation.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        waterColor: 'red',
        secchiDepth: 20,
        phosphorusConcentration: 50,
      })

    expect(response.status).toEqual(403);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("User is not allowed to perform this action")
  });

  it('responds with 400 if water color is not valid', async () => {
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

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    const createdObservation = await Observation.create({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientist.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: createdLocation.id
    })

    const response = await request(api)
      .put(`/observations/${createdObservation.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        waterColor: 'gibberish',
        secchiDepth: 20,
        phosphorusConcentration: 50,
      })

    expect(response.status).toEqual(400);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("Invalid water color")
  });

  it('responds with 404 if observation does not exist', async () => {
    const { currentUser } = await createUser('citizen-scientist')

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation = await Location.create({
      location: JSON.stringify(location)
    })

    await CitizenScientist.create({
      userId: currentUser.id,
      locationId: createdLocation.id,
      address: "Test Address 12"
    });

    const nonExistingObservationId = 20;

    const response = await request(api)
      .put(`/observations/${nonExistingObservationId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        waterColor: 'blue-green',
        secchiDepth: 20,
        phosphorusConcentration: 50,
      })

    expect(response.status).toEqual(404);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("This observation does not exist")
  });
});

describe('DELETE /observations:id', () => {
  it('responds with json success', async () => {
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

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    const createdObservation = await Observation.create({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientist.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: createdLocation.id
    })

    const response = await request(api)
      .delete(`/observations/${createdObservation.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(200);
  });

  it('responds with 403 for user that did not create the observation', async () => {
    const { currentUser } = await createUser('citizen-scientist')
    const observationCreator = await User.create({
      firstName: "Test",
      lastName: "Test2",
      email: "test2@gmail.com",
      passwordHash: "$2a$10$7S5sLHJFCbr62NUYFZhykuDI83f/YCoRhgr2dxpGWRGfxFM72nac."
    })

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation1 = await Location.create({
      location: JSON.stringify(location)
    })

    await CitizenScientist.create({
      userId: currentUser.id,
      locationId: createdLocation1.id,
      address: "Test Address 12"
    });

    const createdLocation2 = await Location.create({
      location: JSON.stringify(location)
    })

    const createdCitizenScientistObservator = await CitizenScientist.create({
      userId: observationCreator.id,
      locationId: createdLocation2.id,
      address: "Test Address 12"
    });

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    const measurementLocation = { type: 'Point', coordinates: [22.22, 44.24]}

    const measurementCreatedLocation = await Location.create({
      location: JSON.stringify(measurementLocation)
    })


    const createdObservation = await Observation.create({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientistObservator.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: measurementCreatedLocation.id
    })


    const response = await request(api)
      .delete(`/observations/${createdObservation.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(403);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("User is not allowed to perform this action")
  });

  it('responds with 404 if observation does not exist', async () => {
    const { currentUser } = await createUser('citizen-scientist')

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation = await Location.create({
      location: JSON.stringify(location)
    })

    await CitizenScientist.create({
      userId: currentUser.id,
      locationId: createdLocation.id,
      address: "Test Address 12"
    });

    const nonExistingObservationId = 20;

    const response = await request(api)
      .delete(`/observations/${nonExistingObservationId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(404);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("This observation does not exist")
  });
});

describe('GET /observations/me', () => {
  it('responds with json success', async () => {
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

    const [rows, affectedRows] = await sequelize.query(`
      insert into bodies_of_water (id, name, geom) values (1, '', null) RETURNING ID;
    `)

    const waterColor = 'blue-green'
    const secchiDepth = 150
    const phosphorusConcentration = 20

    await Observation.create({
      waterColor,
      secchiDepth,
      phosphorusConcentration,
      citizenScientistId: createdCitizenScientist.id,
      //@ts-ignore
      bodyOfWaterId: rows[0].id,
      locationId: createdLocation.id
    })

    const response = await request(api)
      .get(`/observations/me`)
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
      bodyOfWaterId: rows[0].id,
      locationId: createdLocation.id,
      observationRequestId: null
    })
  });

  it('responds with json success with empty rows if no observations exist for the user', async () => {
    const { currentUser } = await createUser('citizen-scientist')

    const location = { type: 'Point', coordinates: [22.22, 44.24]}

    const createdLocation = await Location.create({
      location: JSON.stringify(location)
    })

    await CitizenScientist.create({
      userId: currentUser.id,
      locationId: createdLocation.id,
      address: "Test Address 12"
    });

    const response = await request(api)
      .get(`/observations/me`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(0)
  });

  it('responds with 403 for user that is not a citizen scientist', async () => {
    const { currentUser } = await createUser('biologist')

    await Biologist.create({
      userId: currentUser.id
    });

    const response = await request(api)
      .get('/observations/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(403);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("User is not allowed to perform this action")
  });
});
