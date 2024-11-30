import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_schema_separate_string = (): void =>
  validate_llm_schema_separate_string("chatgpt", false);

export const test_claude_schema_separate_string = (): void =>
  validate_llm_schema_separate_string("claude", true);

export const test_gemini_schema_separate_string = (): void =>
  validate_llm_schema_separate_string("gemini", false);

export const test_llama_schema_separate_string = (): void =>
  validate_llm_schema_separate_string("llama", true);

export const test_llm_v30_schema_separate_string = (): void => {
  validate_llm_schema_separate_string("3.0", false);
  validate_llm_schema_separate_string("3.0", true);
};

export const test_llm_v31_schema_separate_string = (): void => {
  validate_llm_schema_separate_string("3.1", false);
  validate_llm_schema_separate_string("3.1", true);
};

const validate_llm_schema_separate_string = <Model extends ILlmSchema.Model>(
  model: Model,
  constraint: boolean,
): void => {
  const separator = (schema: ILlmSchema.IParameters<Model>) =>
    LlmSchemaComposer.separate(model)({
      predicate: (s) =>
        LlmSchemaComposer.typeChecker(model).isString(
          s as OpenApi.IJsonSchema.IString,
        ) &&
        (constraint
          ? (s as OpenApi.IJsonSchema.IString).contentMediaType !== undefined
          : s.description?.includes("@contentMediaType") === true),
      schema: schema as any,
    });
  const plain: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(
    typia.json.schemas<
      [
        {
          name: string;
        },
      ]
    >(),
  );
  const upload: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(
    typia.json.schemas<
      [
        {
          file: string & tags.ContentMediaType<"image/*">;
        },
      ]
    >(),
  );
  TestValidator.equals("plain")(separator(plain))([plain, null]);
  TestValidator.equals("upload")(separator(upload))([null, upload]);
};

const schema =
  <Model extends ILlmSchema.Model>(model: Model, constraint: boolean) =>
  (collection: IJsonSchemaCollection): ILlmSchema.IParameters<Model> => {
    const schema: ILlmSchema.IParameters<Model> | null =
      LlmSchemaComposer.parameters(model)({
        components: collection.components,
        schema: typia.assert<
          OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference
        >(collection.schemas[0]),
        config: {
          ...LlmSchemaComposer.defaultConfig(model),
          reference: true,
          constraint,
        } satisfies ILlmSchema.IConfig<Model> as any,
      }) as ILlmSchema.IParameters<Model> | null;
    if (schema === null) throw new Error("Invalid schema");
    return schema;
  };
