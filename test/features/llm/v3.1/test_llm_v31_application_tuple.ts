import { TestValidator } from "@nestia/e2e";
import { HttpLlm, IHttpLlmApplication, OpenApi } from "@samchon/openapi";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_v31_application_tuple = (): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      [number, number],
      {
        x: [number, string];
        y: [string, number];
      },
      {
        props: {
          items: Array<{
            nested: [number, boolean];
          }>;
        };
      },
    ]
  >();
  const document: OpenApi.IDocument = {
    openapi: "3.1.0",
    components: collection.components,
    paths: {
      "/plus": {
        post: {
          parameters: [
            {
              in: "query" as const,
              name: "values",
              schema: collection.schemas[0],
            } satisfies OpenApi.IOperation.IParameter,
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: collection.schemas[0],
              },
            },
          },
          responses: {
            201: {
              content: {
                "application/json": {
                  schema: collection.schemas[0],
                },
              },
            },
          },
        },
      },
      "/minus": {
        post: {
          requestBody: {
            content: {
              "application/json": {
                schema: collection.schemas[1],
              },
            },
          },
        },
      },
      "/delta": {
        post: {
          requestBody: {
            content: {
              "application/json": {
                schema: collection.schemas[2],
              },
            },
          },
        },
      },
    },
    "x-samchon-emended": true,
  };
  const app: IHttpLlmApplication<"3.1"> = HttpLlm.application({
    model: "3.1",
    document,
  });

  TestValidator.equals("#success")(app.functions.length)(0);
  TestValidator.equals("#errors")(app.errors.length)(3);
  TestValidator.equals("accessors")(
    app.errors.map((error) =>
      error.messages.map((m) => m.split(":")[0]).sort(),
    ),
  )([
    [
      '$input.components.schemas["IApiPlus.PostBody"]',
      '$input.components.schemas["IApiPlus.PostResponse"]',
      '$input.components.schemas["IApiPlus.PostQuery"].properties["values"]',
    ].sort(),
    [
      '$input.components.schemas["IApiMinus.PostBody"].properties["x"]',
      '$input.components.schemas["IApiMinus.PostBody"].properties["y"]',
    ].sort(),
    [
      '$input.components.schemas["IApiDelta.PostBody"].properties["props"].properties["items"].items.properties["nested"]',
    ].sort(),
  ]);
};
