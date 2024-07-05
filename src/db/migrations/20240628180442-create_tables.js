'use strict';
const fs = require("fs");
const path = require("path");
const readFile = require("util").promisify(fs.readFile);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const queryPath = path.resolve(
        __dirname,
        "../create-tables.sql"
      );
      const query = await readFile(queryPath, "utf8");
      await queryInterface.sequelize.query(query);
    } catch (err) {
      console.error("Unable to create tables: ", err);
      throw(err)
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      const queryPath = path.resolve(__dirname, "../drop-tables.sql");
      const query = await readFile(queryPath, "utf8");
      await queryInterface.sequelize.query(query);
    } catch (err) {
      console.error("Unable to drop tables: ", err);
      throw(err)
    }
  }
};
