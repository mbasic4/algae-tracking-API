'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE "observations"(
        "id" SERIAL PRIMARY KEY,
        "water_color" VARCHAR(256),
        "secchi_depth" INT,
        "phosphorus_concentration" INT,
        "citizen_scientist_id" INT NOT NULL,
        "body_of_water_id" INT NOT NULL,
        "location_id" INT NOT NULL,
        "observation_request_id" INT,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      );

      ALTER TABLE "observations" ADD CONSTRAINT "fk_observations_citizen_scientists" FOREIGN KEY ("citizen_scientist_id") REFERENCES "citizen_scientists" ("id");
      ALTER TABLE "observations" ADD CONSTRAINT "fk_observations_bodies_od_water" FOREIGN KEY ("body_of_water_id") REFERENCES "bodies_of_water" ("id");
      ALTER TABLE "observations" ADD CONSTRAINT "fk_observations_locations" FOREIGN KEY ("location_id") REFERENCES "locations" ("id");
      ALTER TABLE "observations" ADD CONSTRAINT "fk_observations_observation_requests" FOREIGN KEY ("observation_request_id") REFERENCES "observation_requests" ("id");
    `)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE observations;
    `)
  }
};
