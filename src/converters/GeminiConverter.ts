import { OpenApi } from "../OpenApi";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { ILlmSchema } from "../structures/ILlmSchema";
import { LlmTypeChecker } from "../utils/LlmTypeChecker";
import { HttpLlmConverter } from "./HttpLlmConverter";

export namespace GeminiConverter {
  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): IGeminiSchema | null => {
    const schema: ILlmSchema | null = HttpLlmConverter.schema(props);
    if (schema === null) return null;

    let union: boolean = false;
    LlmTypeChecker.visit(schema, (v) => {
      if (LlmTypeChecker.isOneOf(v)) union = true;
    });
    return union ? null : schema;
  };
}
