import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { DatabaseProviderModule } from './providers/database/provider.module';
import { TasksModule } from './tasks/tasks.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from './email/email.module';
import KeyvRedis from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig], 
      isGlobal: true,     }),
    ThrottlerModule.forRoot([
    {
      ttl: 60000,
      limit: 100,
    },
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ) => ({
        stores: [
          new KeyvRedis(
            configService.get<string>('REDIS_URL'),
          ),
        ],
        ttl: 6000,
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
      }),
    }),
    DatabaseProviderModule, 
    ProjectsModule, 
    UsersModule, 
    AuthModule, TasksModule, EmailModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,

      useClass:ThrottlerGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}