import { Module } from "@nestjs/common";

import { AppController } from "./AppController";

@Module({
  controllers: [AppController],
})
export class AppModule {}
