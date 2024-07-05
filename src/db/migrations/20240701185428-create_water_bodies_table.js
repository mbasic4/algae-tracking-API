'use strict';

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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE bodies_of_water;`)
  }
};
