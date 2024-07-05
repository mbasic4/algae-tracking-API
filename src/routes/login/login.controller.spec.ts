import request from "supertest"
import { api } from "../../api";
import { clearDB } from "../../testUtils/clearDb";
import User from "../../db/models/User";

beforeEach(async () => {
  await clearDB()
});

describe('POST /login', function() {
  it('responds with json success', async () => {
    await User.create({
      firstName: "Test",
      lastName: "Test",
      email: "test@gmail.com",
      passwordHash: "$2a$10$7S5sLHJFCbr62NUYFZhykuDI83f/YCoRhgr2dxpGWRGfxFM72nac."
    })

    const response = await request(api)
      .post('/login')
      .set('Accept', 'application/json')
      .send({
        email: "test@gmail.com",
        password: "123123"
      })
    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.message).toEqual('Authentication successful!')
  });

  it('responds with 401 when password is wrong', async () => {
    await User.create({
      firstName: "Test",
      lastName: "Test",
      email: "test@gmail.com",
      passwordHash: "$2a$10$7S5sLHJFCbr62NUYFZhykuDI83f/YCoRhgr2dxpGWRGfxFM72nac."
    })

    const response = await request(api)
      .post('/login')
      .set('Accept', 'application/json')
      .send({
        email: "test@gmail.com",
        password: "wrong_password"
      })
    expect(response.status).toEqual(401);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual('Wrong password!')
  });

  it('responds with 404 when email is wrong', async () => {
    await User.create({
      firstName: "Test",
      lastName: "Test",
      email: "test@gmail.com",
      passwordHash: "$2a$10$7S5sLHJFCbr62NUYFZhykuDI83f/YCoRhgr2dxpGWRGfxFM72nac."
    })

    const response = await request(api)
      .post('/login')
      .set('Accept', 'application/json')
      .send({
        email: "unknown@unknown.com",
        password: "123123"
      })
    expect(response.status).toEqual(404);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual('Email does not exist!')
  });
});