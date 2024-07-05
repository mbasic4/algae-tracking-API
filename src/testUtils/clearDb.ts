import sequelize from "../db/config";

export async function clearDB() {
  await sequelize.query(`
    TRUNCATE observations, observation_requests, citizen_scientists, locations, biologists, users, bodies_of_water
  `)
}
