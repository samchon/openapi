import { OpenApi } from "../OpenApi";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { LlmTypeCheckerV3 } from "../utils/LlmTypeCheckerV3";
import { OpenApiContraintShifter } from "../utils/OpenApiContraintShifter";
import { LlmConverterV3 } from "./LlmConverterV3";

export namespace GeminiConverter {
  export const parameters = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }): IGeminiSchema.IParameters | null =>
    schema(props) as IGeminiSchema.IParameters | null;

  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }): IGeminiSchema | null => {
    const schema: ILlmSchemaV3 | null = LlmConverterV3.schema(props);
    if (schema === null) return null;

    let union: boolean = false;
    LlmTypeCheckerV3.visit(schema, (v) => {
      if (v.title !== undefined) {
        if (v.description === undefined) v.description = v.title;
        else {
          const title: string = v.title.endsWith(".")
            ? v.title.substring(0, v.title.length - 1)
            : v.title;
          v.description = v.description.startsWith(title)
            ? v.description
            : `${title}.\n\n${v.description}`;
        }
        delete v.title;
      }
      if (LlmTypeCheckerV3.isOneOf(v)) union = true;
      else if (LlmTypeCheckerV3.isObject(v)) {
        if (v.additionalProperties !== undefined)
          delete (v as Partial<ILlmSchemaV3.IObject>).additionalProperties;
      } else if (LlmTypeCheckerV3.isArray(v))
        OpenApiContraintShifter.shiftArray(v);
      else if (LlmTypeCheckerV3.isString(v))
        OpenApiContraintShifter.shiftString(v);
      else if (LlmTypeCheckerV3.isNumber(v) || LlmTypeCheckerV3.isInteger(v))
        OpenApiContraintShifter.shiftNumeric(v);
    });
    return union ? null : schema;
  };

  export const separate = (props: {
    predicate: (schema: IGeminiSchema) => boolean;
    schema: IGeminiSchema;
  }): [IGeminiSchema | null, IGeminiSchema | null] =>
    LlmConverterV3.separate(
      props as {
        predicate: (schema: ILlmSchemaV3) => boolean;
        schema: ILlmSchemaV3;
      },
    );
}
