'use strict';
const dotenv = require('dotenv');
dotenv.config();
const path = require("path");
const { execSync } = require('child_process');

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT || "5433";

const environment = process.env.NODE_ENV

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
    `CREATE TABLE "bodies_of_water" (id serial,
        "st_area_sh" numeric,
        "gm_soc" varchar(3),
        "f_code" int4,
        "name" varchar(150),
        "gm_hyt" int4,
        "region" int4,
        "gm_nam" varchar(150),
        "gm_f_code" varchar(5),
        "feature" varchar(50),
        "sdelength_" numeric,
        "state_fips" varchar(20),
        "area_sq_mi" numeric,
        "state" varchar(20),
        "waterbdyid" int4,
        "perim_mi" numeric,
        "gm_hyc" int4);

        ALTER TABLE "bodies_of_water" ADD PRIMARY KEY (id);
    
        SELECT AddGeometryColumn('','bodies_of_water','geom','0','MULTIPOLYGON',2);`
    )

    if (environment !== "test") {
      const fullPath = path.resolve(
        __dirname,
        "../seeders/us-water-bodies.shp"
      );
    
      execSync(
        `shp2pgsql -a -s 4326 ${fullPath} bodies_of_water | PGPASSWORD=${DB_PASSWORD} psql -d ${DB_NAME} -h localhost -p ${DB_PORT} -U ${DB_USER} `,
        { stdio: 'ignore' }
      )
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE bodies_of_water;`)
  }
};
