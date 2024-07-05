import dotenv from 'dotenv';
dotenv.config();
import path from "path";
const { execSync } = require('child_process');

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT || "5433";


export function importWaterBodiesData() {
  const fullPath = path.resolve(
    __dirname,
    "../db/seeders/us-water-bodies.shp"
  );

  console.log(fullPath)

  execSync(
    `shp2pgsql -a -s 4326 ${fullPath} bodies_of_water | PGPASSWORD=${DB_PASSWORD} psql -d ${DB_NAME} -h localhost -p ${DB_PORT} -U ${DB_USER} `,
    { stdio: 'ignore' }
  )
};

importWaterBodiesData();
