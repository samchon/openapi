import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  ILlmSchemaV3,
  LlmTypeCheckerV3,
  OpenApi,
} from "@samchon/openapi";
import { LlmConverterV3 } from "@samchon/openapi/lib/converters/LlmConverterV3";
import typia, { tags } from "typia";

export const test_llm_schema_separate_array = (): void => {
  const separator = (schema: ILlmSchemaV3) =>
    LlmConverterV3.separate({
      predicate: (s) =>
        LlmTypeCheckerV3.isString(s) && s.contentMediaType !== undefined,
      schema,
    });
  const member: ILlmSchemaV3 = schema(typia.json.application<[IMember[]]>());
  const upload: ILlmSchemaV3 = schema(
    typia.json.application<[IFileUpload[]]>(),
  );
  const combined: ILlmSchemaV3 = schema(
    typia.json.application<[ICombined[]]>(),
  );

  TestValidator.equals("member")(separator(member))([member, null]);
  TestValidator.equals("upload")(separator(upload))([null, upload]);
  TestValidator.equals("combined")(separator(combined))([member, upload]);
};

interface IMember {
  id: number;
  name: string;
}
interface IFileUpload {
  file: string & tags.ContentMediaType<"image/png">;
}
interface ICombined extends IMember, IFileUpload {}

const schema = (props: {
  components: OpenApi.IComponents;
  schemas: OpenApi.IJsonSchema[];
}): ILlmSchemaV3 => {
  const schema: ILlmSchemaV3 | null = HttpLlm.schema({
    model: "3.0",
    components: props.components,
    schema: props.schemas[0],
    recursive: false,
  });
  if (schema === null) throw new Error("Invalid schema");
  return schema;
};
