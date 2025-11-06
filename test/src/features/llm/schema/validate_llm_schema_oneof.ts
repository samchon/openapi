import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, IOpenApiSchemaError, IResult } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_anyof = (): void =>
  validate_llm_schema_oneof("chatgpt", "anyOf", false);

export const test_claude_schema_oneof = (): void =>
  validate_llm_schema_oneof("claude", "oneOf", true);

export const test_llm_v30_schema_oneof = (): void =>
  validate_llm_schema_oneof("3.0", "oneOf", false);

export const test_llm_v31_schema_oneof = (): void =>
  validate_llm_schema_oneof("3.1", "oneOf", true);

const validate_llm_schema_oneof = <Model extends ILlmSchema.Model>(
  model: Model,
  field: "oneOf" | "anyOf",
  constant: boolean,
): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<[IPoint | ILine | ITriangle | IRectangle]>();

  const $defs: Record<string, ILlmSchema<Model>> = {};
  const result: IResult<
    ILlmSchema<Model>,
    IOpenApiSchemaError
  > = LlmSchemaComposer.schema(model)({
    $defs: $defs as any,
    components: collection.components,
    schema: collection.schemas[0],
    config: {
      ...LlmSchemaComposer.defaultConfig(model),
      reference: false,
    } as any,
  }) as IResult<ILlmSchema<Model>, IOpenApiSchemaError>;
  TestValidator.equals("success")(result.success);
  TestValidator.equals(field)(["point", "line", "triangle", "rectangle"])(
    (result as any)?.value?.[field]?.map((e: any) =>
      constant ? e.properties?.type?.const : e.properties?.type?.enum?.[0],
    ),
  );
};

interface IPoint {
  type: "point";
  x: number;
  y: number;
}
interface ILine {
  type: "line";
  p1: IPoint;
  p2: IPoint;
}
interface ITriangle {
  type: "triangle";
  p1: IPoint;
  p2: IPoint;
  p3: IPoint;
}
interface IRectangle {
  type: "rectangle";
  p1: IPoint;
  p2: IPoint;
  p3: IPoint;
  p4: IPoint;
}
