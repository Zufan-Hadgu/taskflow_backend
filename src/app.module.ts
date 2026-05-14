import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { DatabaseProviderModule } from './providers/database/provider.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig], 
      isGlobal: true,     }),
    DatabaseProviderModule, 
    ProjectsModule, 
    UsersModule, 
    AuthModule, TasksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
