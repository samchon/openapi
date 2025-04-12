import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  OpenApi,
  SwaggerV2,
} from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../TestGlobal";

export const test_issue_104_upgrade_v20_allOf = async (): Promise<void> => {
  const swagger: SwaggerV2.IDocument = typia.assert<SwaggerV2.IDocument>(
    JSON.parse(
      await fs.promises.readFile(
        `${TestGlobal.ROOT}/examples/v2.0/semanticscholar.json`,
        "utf8",
      ),
    ),
  );
  const document: OpenApi.IDocument = OpenApi.convert(swagger);
  TestValidator.predicate("allOf")(
    () => JSON.stringify(document).indexOf("#/definitions") === -1,
  );
  for (const collection of Object.values(document.paths ?? {}))
    for (const operation of Object.values(collection))
      if (typia.is<OpenApi.IOperation>(operation)) {
        const length: number =
          (operation.summary?.length ? operation.summary.length + 3 : 0) +
          (operation.description?.length ?? 0);
        if (length <= 1_024 || operation.description === undefined) continue;
        operation.description = operation.description.slice(
          0,
          operation.description.length - (length - 1_024),
        );
      }

  const app: IHttpLlmApplication<"claude"> = HttpLlm.application({
    model: "claude",
    document,
  });
  TestValidator.equals("errors")(app.errors.length)(0);
};
