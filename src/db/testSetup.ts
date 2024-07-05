import dotenv from 'dotenv'
dotenv.config()

module.exports = async() => {
  process.env.DB_NAME = "test_db";
  process.env.DB_USER = "test_user";
  process.env.DB_HOST = 'localhost';
  process.env.DB_PASSWORD = 'test_password';
  process.env.DB_PORT = "5434";

  await runMigrations()
}

const {exec} = require('child_process');

async function runMigrations() {
  await new Promise<void>((resolve, reject) => {
    const migrate = exec(
      'npx sequelize-cli db:migrate',
      {env: process.env},
      (err: any) => (err ? reject(err): resolve())
    );
  
    // Forward stdout+stderr to this process
    migrate.stdout.pipe(process.stdout);
    migrate.stderr.pipe(process.stderr);
  });
}
