import fs from "fs";
import path from "path";
import typia from "typia";

import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "../src";
import { test_downgrade_v30 } from "./features/test_downgrade_v30";
import { test_downgrade_v20 } from "./features/test_downgrade_v20";

const CONVERTED: string = `${__dirname}/../../examples/converted`;

const validate = (
  title: string,
  document:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument
    | OpenApi.IDocument,
): OpenApi.IDocument => {
  console.log("  -", title);
  console.log("    - type assertion");
  typia.assert(document);

  console.log("    - convert to emended v3.1");
  return typia.assert(OpenApi.convert(document));
};
const iterate = async (directory: string): Promise<void> => {
  for (const file of await fs.promises.readdir(directory)) {
    const location: string = `${directory}/${file}`;
    const stat: fs.Stats = await fs.promises.stat(location);
    const name: string = file.substring(0, file.length - 5);

    if (stat.isDirectory() === true) await iterate(location);
    else if (file.endsWith(".json") === true) {
      const document: OpenApi.IDocument = await validate(
        path.resolve(location),
        JSON.parse(await fs.promises.readFile(location, "utf8")),
      );
      await fs.promises.writeFile(
        `${CONVERTED}/${name}-v31.json`,
        JSON.stringify(document, null, 2),
      );

      console.log(`    - downgrade to v2.0`);

      const v20: SwaggerV2.IDocument = OpenApi.downgrade(document, "2.0");
      typia.assert(v20);
      typia.assert(OpenApi.convert(v20));
      await fs.promises.writeFile(
        `${CONVERTED}/${name}-v20.json`,
        JSON.stringify(v20, null, 2),
      );

      console.log(`    - downgrade to v3.0`);

      const v30: OpenApiV3.IDocument = OpenApi.downgrade(document, "3.0");
      typia.assert(v30);
      typia.assert(OpenApi.convert(v30));
      await fs.promises.writeFile(
        `${CONVERTED}/${name}-v30.json`,
        JSON.stringify(v30, null, 2),
      );
    }
  }
};
const main = async (): Promise<void> => {
  try {
    await fs.promises.mkdir(CONVERTED);
  } catch {}
  console.log("Test OpenAPI conversion");
  await iterate(`${__dirname}/../../examples/v2.0`);
  await iterate(`${__dirname}/../../examples/v3.0`);
  await iterate(`${__dirname}/../../examples/v3.1`);

  test_downgrade_v20();
  test_downgrade_v30();
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
