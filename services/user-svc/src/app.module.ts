
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { KycModule } from './kyc/kyc.module';
import { SessionModule } from './session/session.module';
import { KafkaModule } from './kafka/kafka.module';
import { User } from './user/entities/user.entity';
import { Session } from './session/entities/session.entity';
import { KycDocument } from './kyc/entities/kyc-document.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'payflow_user',
      password: process.env.DB_PASSWORD || 'payflow_pass',
      database: process.env.DB_NAME || 'payflow_db',
      entities: [User, Session, KycDocument],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
    UserModule,
    KycModule,
    SessionModule,
    KafkaModule,
  ],
})
export class AppModule {}
