import * as path from 'path'
import { Knex } from 'knex'
import dotenv from 'dotenv'

dotenv.config()

const config: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: path.join(__dirname, 'migrations'),
  },
}

export default config
