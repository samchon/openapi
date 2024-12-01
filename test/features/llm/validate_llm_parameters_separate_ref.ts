import { TestValidator } from "@nestia/e2e";
import {
  IChatGptSchema,
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_parameters_separate_ref = (): void =>
  validate_llm_parameters_separate_ref("chatgpt", false);

export const test_claude_parameters_separate_ref = (): void =>
  validate_llm_parameters_separate_ref("claude", true);

export const test_llama_parameters_separate_ref = (): void =>
  validate_llm_parameters_separate_ref("llama", true);

export const test_llm_v31_parameters_separate_ref = (): void => {
  validate_llm_parameters_separate_ref("3.1", false);
  validate_llm_parameters_separate_ref("3.1", true);
};

const validate_llm_parameters_separate_ref = <
  Model extends Exclude<ILlmSchema.Model, "3.0" | "gemini">,
>(
  model: Model,
  constraint: boolean,
): void => {
  const separator = (schema: ILlmSchema.IParameters<Model>) =>
    LlmSchemaComposer.separateParameters(model)({
      predicate: (s) =>
        LlmSchemaComposer.typeChecker(model).isString(
          s as OpenApi.IJsonSchema.IString,
        ) &&
        (constraint
          ? (s as OpenApi.IJsonSchema.IString).contentMediaType !== undefined
          : s.description?.includes("@contentMediaType") === true),
      parameters: schema as any,
    });
  const member: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(typia.json.schemas<[IWrapper<IMember>]>());
  const upload: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(typia.json.schemas<[IWrapper<IFileUpload>]>());
  const combined: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(typia.json.schemas<[IWrapper<ICombined>]>());

  TestValidator.equals("member")(separator(member))({
    llm: member,
    human: null,
  });
  TestValidator.equals("upload")(separator(upload))({
    llm: null,
    human: upload,
  });
  TestValidator.equals("combined")({
    llm: separator(combined).llm
      ? { ...separator(combined).llm, $defs: {} }
      : null,
    human: separator(combined).human
      ? { ...separator(combined).human, $defs: {} }
      : null,
  })({
    llm: {
      $defs: {},
      type: "object",
      properties: {
        value: {
          $ref: "#/$defs/ICombined.Llm",
        },
      },
      required: ["value"],
      additionalProperties: false,
    } satisfies IChatGptSchema.IParameters,
    human: {
      $defs: {},
      type: "object",
      properties: {
        value: {
          $ref: "#/$defs/ICombined.Human",
        },
      },
      required: ["value"],
      additionalProperties: false,
    } satisfies IChatGptSchema.IParameters,
  });
};

interface IWrapper<T> {
  value: T;
}
interface IMember {
  id: number;
  name: string;
}
interface IFileUpload {
  file: string & tags.Format<"uri"> & tags.ContentMediaType<"image/png">;
}
interface ICombined extends IMember, IFileUpload {}

const schema =
  <Model extends ILlmSchema.Model>(model: Model, constraint: boolean) =>
  (collection: IJsonSchemaCollection): ILlmSchema.IParameters<Model> => {
    const result: IResult<
      ILlmSchema.IParameters<Model>,
      IOpenApiSchemaError
    > = LlmSchemaComposer.parameters(model)({
      components: collection.components,
      schema: typia.assert<
        OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference
      >(collection.schemas[0]),
      config: {
        ...LlmSchemaComposer.defaultConfig(model),
        reference: true,
        constraint,
      } satisfies ILlmSchema.IConfig<Model> as any,
    }) as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
    if (result.success === false) throw new Error("Invalid schema");
    return result.value;
  };
