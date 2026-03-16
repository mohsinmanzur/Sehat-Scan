import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";

export default (): PostgresConnectionOptions => ({

    type: 'postgres',
    host: process.env.PGHOST,
    port: +(process.env.PGPORT ?? 5432),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: true,
})