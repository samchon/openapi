import { OpenApi } from "../OpenApi";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { LlmTypeCheckerV3 } from "../utils/LlmTypeCheckerV3";
import { LlmConverterV3 } from "./LlmConverterV3";

export namespace GeminiConverter {
  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }): IGeminiSchema | null => {
    const schema: ILlmSchemaV3 | null = LlmConverterV3.schema(props);
    if (schema === null) return null;

    let union: boolean = false;
    LlmTypeCheckerV3.visit(schema, (v) => {
      if (LlmTypeCheckerV3.isOneOf(v)) union = true;
    });
    return union ? null : schema;
  };

  export const separate = (props: {
    predicate: (schema: IGeminiSchema) => boolean;
    schema: IGeminiSchema;
  }): [IGeminiSchema | null, IGeminiSchema | null] =>
    LlmConverterV3.separate(props);
}
