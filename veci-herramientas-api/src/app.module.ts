import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ToolsModule } from './tools/tools.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '1433', 10),
        
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        
        database: configService.get<string>('DB_NAME'),
        
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, 

        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      }),
    }),
    AuthModule,
    UsersModule,
    ToolsModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}