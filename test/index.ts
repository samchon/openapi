import { DynamicExecutor } from "@nestia/e2e";
import { NestFactory } from "@nestjs/core";
import chalk from "chalk";

import { AppFilter } from "./controllers/AppFilter";
import { AppModule } from "./controllers/AppModule";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

const main = async (): Promise<void> => {
  // PREPARE SERVER
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalFilters(new AppFilter(app.getHttpAdapter()));
  await app.listen(3_000);

  // DO TEST
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    prefix: "test_",
    location: __dirname + "/features",
    parameters: () => [
      {
        host: `http://localhost:3000`,
      },
    ],
    onComplete: (exec) => {
      const trace = (str: string) =>
        console.log(`  - ${chalk.green(exec.name)}: ${str}`);
      if (exec.error === null) {
        const elapsed: number =
          new Date(exec.completed_at).getTime() -
          new Date(exec.started_at).getTime();
        trace(`${chalk.yellow(elapsed.toLocaleString())} ms`);
      } else trace(chalk.red(exec.error.name));
    },
  });

  // REPORT EXCEPTIONS
  const exceptions: Error[] = report.executions
    .filter((exec) => exec.error !== null)
    .map((exec) => exec.error!);
  if (exceptions.length === 0) {
    console.log("Success");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  } else {
    for (const exp of exceptions) console.log(exp);
    console.log("Failed");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  }
  await app.close();
  if (exceptions.length) process.exit(-1);
};
main().catch(console.error);
