'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE "observation_requests"(
        "id" SERIAL PRIMARY KEY,
        "biologist_id" INT NOT NULL,
        "body_of_water_id" INT NOT NULL,
        "location_id" INT NOT NULL,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL,
        UNIQUE("biologist_id", "body_of_water_id")
      );

      ALTER TABLE "observation_requests" ADD CONSTRAINT "fk_observation_requests_biologists" FOREIGN KEY ("biologist_id") REFERENCES "biologists" ("id");
      ALTER TABLE "observation_requests" ADD CONSTRAINT "fk_observation_requests_bodies_od_water" FOREIGN KEY ("body_of_water_id") REFERENCES "bodies_of_water" ("id");
      ALTER TABLE "observation_requests" ADD CONSTRAINT "fk_observation_requests_locations" FOREIGN KEY ("location_id") REFERENCES "locations" ("id");
    `)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE observation_requests;
    `)
  }
};
