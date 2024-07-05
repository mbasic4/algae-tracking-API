import request from "supertest"
import { api } from "../../api";
import { clearDB } from "../../testUtils/clearDb";
import User from "../../db/models/User";

const mockedFetch = jest.fn() as jest.MockedFunction<typeof fetch>

const mockResponse = (statusCode: number, body: any): any => {
  return {
    statusCode: statusCode,
    json: () => Promise.resolve(body)
  }
}
//@ts-ignore
global.fetch = mockedFetch;

beforeEach(async () => {
  await clearDB();
});

afterEach(async () => {
  jest.clearAllMocks();
})

describe('POST /signup/citizen-scientist', function() {
  it('responds with json success', async () => {
    mockedFetch.mockResolvedValue(mockResponse(200, { results: [{ position: { lat: 0, lon: 0 } }] }))

    const response = await request(api)
      .post('/signup/citizen-scientist')
      .set('Accept', 'application/json')
      .send({
        firstName: "Test",
        lastName: "Test",
        email: "test@gmail.com",
        password: "123123",
        address: "Test Address 12"
      })

    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.message).toEqual('Authentication successful!')
  });

  it('responds with 409 when email is already taken', async () => {
    mockedFetch.mockResolvedValue(mockResponse(200, { results: [{ position: { lat: 0, lon: 0 } }] }))

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
        password: "123123",
        address: "Test Address 12"
      })

    expect(response.status).toEqual(409);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual('Email already exists')
  });
})
