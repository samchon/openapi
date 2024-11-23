import { TestValidator } from "@nestia/e2e";
import { ILlmSchemaV3, LlmTypeCheckerV3, OpenApi } from "@samchon/openapi";
import { LlmConverterV3 } from "@samchon/openapi/lib/converters/LlmConverterV3";
import typia, { tags } from "typia";

export const test_llm_schema_separate_object = (): void => {
  const separator = (schema: ILlmSchemaV3) =>
    LlmConverterV3.separate({
      predicate: (s) =>
        LlmTypeCheckerV3.isString(s) && s.contentMediaType !== undefined,
      schema,
    });
  const member: ILlmSchemaV3 = schema(typia.json.schemas<[IMember]>());
  const upload: ILlmSchemaV3 = schema(typia.json.schemas<[IFileUpload]>());
  const combined: ILlmSchemaV3 = schema(typia.json.schemas<[ICombined]>());

  TestValidator.equals(
    "member",
    (key) => key === "additionalProperties",
  )(separator(member))([member, null]);
  TestValidator.equals(
    "upload",
    (key) => key === "additionalProperties",
  )(separator(upload))([null, upload]);
  TestValidator.equals(
    "combined",
    (key) => key === "additionalProperties",
  )(separator(combined))([member, upload]);
};

interface IMember {
  id: number;
  name: string;
}
interface IFileUpload {
  file: string & tags.Format<"uri"> & tags.ContentMediaType<"image/png">;
}
interface ICombined extends IMember, IFileUpload {}

const schema = (props: {
  components: OpenApi.IComponents;
  schemas: OpenApi.IJsonSchema[];
}): ILlmSchemaV3 => {
  const schema: ILlmSchemaV3 | null = LlmConverterV3.schema({
    components: props.components,
    schema: props.schemas[0],
    config: {
      recursive: false,
      constraint: true,
    },
  });
  if (schema === null) throw new Error("Invalid schema");
  return schema;
};
