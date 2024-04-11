import fs from "fs";
import path from "path";
import typia from "typia";

import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "../src";

console.log("Test OpenAPI conversion");

const validate = (
  title: string,
  document: SwaggerV2.IDocument | OpenApiV3.IDocument | OpenApiV3_1.IDocument,
): OpenApi.IDocument => {
  console.log("  -", title);
  console.log("    - type assertion");
  typia.assert(document);

  console.log("    - conversion");
  return typia.assert(OpenApi.convert(document));
};
const iterate = async (directory: string): Promise<void> => {
  for (const file of await fs.promises.readdir(directory)) {
    const location: string = `${directory}/${file}`;
    const stat: fs.Stats = await fs.promises.stat(location);
    if (stat.isDirectory() === true) await iterate(location);
    else if (file.endsWith(".json") === true) {
      const normalized: OpenApi.IDocument = await validate(
        path.resolve(location),
        JSON.parse(await fs.promises.readFile(location, "utf8")),
      );
      await fs.promises.writeFile(
        `${__dirname}/../../examples/normalized/${file}`,
        JSON.stringify(normalized, null, 2),
      );
    }
  }
};
const main = async (): Promise<void> => {
  try {
    await fs.promises.mkdir(`${__dirname}/../../examples/normalized`);
  } catch {}
  await iterate(`${__dirname}/../../examples`);
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
