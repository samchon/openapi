import { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./controllers/AppModule";

export const NESTIA_CONFIG: INestiaConfig = {
  input: () => NestFactory.create(AppModule),
  swagger: {
    output: "./swagger.json",
    beautify: true,
  },
};
export default NESTIA_CONFIG;
