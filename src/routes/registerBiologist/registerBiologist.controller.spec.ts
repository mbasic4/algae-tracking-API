import request from "supertest"
import { api } from "../../api";
import { clearDB } from "../../testUtils/clearDb";
import User from "../../db/models/User";

beforeEach(async () => {
  await clearDB()
});

describe('POST /signup/biologist', function() {
  it('responds with json success', async () => {
    const response = await request(api)
      .post('/signup/biologist')
      .set('Accept', 'application/json')
      .send({
        firstName: "Test",
        lastName: "Test",
        email: "test@gmail.com",
        password: "123123"
      })

    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.message).toEqual('Authentication successful!')
  });

  it('responds with 409 when email is already taken', async () => {
    await User.create({
      firstName: "Test",
      lastName: "Test",
      email: "test@gmail.com",
      passwordHash: "$2a$10$7S5sLHJFCbr62NUYFZhykuDI83f/YCoRhgr2dxpGWRGfxFM72nac."
    })

    const response = await request(api)
      .post('/signup/biologist')
      .set('Accept', 'application/json')
      .send({
        firstName: "Test",
        lastName: "Test",
        email: "test@gmail.com",
        password: "123123"
      })

    expect(response.status).toEqual(409);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual('Email already exists')
  });
})
