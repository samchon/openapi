import { IMigrateDocument, OpenApi, OpenApiV3 } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

export const test_document_migrate_v30 = async (): Promise<void> => {
  const path: string = `${__dirname}/../../../examples/v3.0`;
  for (const file of await fs.promises.readdir(path)) {
    if (file.endsWith(".json") === false) continue;
    const swagger: OpenApiV3.IDocument = typia.assert<OpenApiV3.IDocument>(
      JSON.parse(await fs.promises.readFile(`${path}/${file}`, "utf8")),
    );
    const openapi: OpenApi.IDocument = OpenApi.convert(swagger);
    const migrate: IMigrateDocument = OpenApi.migrate(openapi);
    typia.assert(migrate);
  }
};
