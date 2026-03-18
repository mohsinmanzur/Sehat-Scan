import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { ConfigService } from '@nestjs/config';

export default (configService: ConfigService): PostgresConnectionOptions => {

    return {
        type: 'postgres',
        host: configService.get<string>('PGHOST'),
        port: configService.get<number>('PGPORT') || 5432,
        username: configService.get<string>('PGUSER'),
        password: configService.get<string>('PGPASSWORD'),
        database: configService.get<string>('PGDATABASE'),
        ssl: configService.get<string>('PGSSLMODE') === 'require' ? { rejectUnauthorized: false } : false,
        entities: [__dirname + '/../**/*.entity.{ts,js}'],
        synchronize: true,
    }
}