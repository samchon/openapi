import { DynamicExecutor } from "@nestia/e2e";

const main = async (): Promise<void> => {
  // DO TEST
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    prefix: "test_",
    parameters: () => [],
  })(__dirname + "/features");

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
  if (exceptions.length) process.exit(-1);
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
