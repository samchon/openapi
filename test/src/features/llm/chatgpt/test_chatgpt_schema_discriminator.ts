import { TestValidator } from "@nestia/e2e";
import {
  ChatGptTypeChecker,
  IChatGptSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
  OpenApiTypeChecker,
} from "@samchon/openapi";
import { ChatGptSchemaComposer } from "@samchon/openapi/lib/composers/llm/ChatGptSchemaComposer";
import typia, { IJsonSchemaUnit } from "typia";

export const test_chatgpt_schema_discriminator = (): void => {
  const $defs: Record<string, IChatGptSchema> = {};
  const unit: IJsonSchemaUnit = typia.json.schema<ICat | IAnt>();
  const result: IResult<IChatGptSchema, IOpenApiSchemaError> =
    ChatGptSchemaComposer.schema({
      config: {
        reference: true,
      },
      $defs: {},
      components: unit.components,
      schema: unit.schema,
    });
  if (result.success === false) throw new Error("Failed to transform");
  TestValidator.predicate("discriminator")(
    () =>
      ChatGptTypeChecker.isAnyOf(result.value) &&
      result.value["x-discriminator"] !== undefined &&
      result.value["x-discriminator"].mapping !== undefined &&
      Object.values(result.value["x-discriminator"].mapping).every((k) =>
        k.startsWith("#/$defs/"),
      ),
  );

  const invert: OpenApi.IJsonSchema = ChatGptSchemaComposer.invert({
    components: {},
    $defs,
    schema: result.value,
  });
  TestValidator.predicate("invert")(
    () =>
      OpenApiTypeChecker.isOneOf(invert) &&
      invert.discriminator !== undefined &&
      invert.discriminator.mapping !== undefined &&
      Object.values(invert.discriminator.mapping).every((k) =>
        k.startsWith("#/components/schemas/"),
      ),
  );
};

interface ICat {
  type: "cat";
  name: string;
  ribbon: boolean;
}
interface IAnt {
  type: "ant";
  name: string;
  role: "queen" | "soldier" | "worker";
}
