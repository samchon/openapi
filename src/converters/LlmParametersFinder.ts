import { OpenApi } from "../OpenApi";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";

export namespace LlmParametersFinder {
  export const find = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    errors?: string[];
    accessor?: string;
  }): OpenApi.IJsonSchema.IObject | null => {
    const mismatches: Set<string> = new Set();
    const entity: OpenApi.IJsonSchema | null = OpenApiTypeChecker.unreference({
      components: props.components,
      schema: props.schema,
      mismatches,
    });
    if (entity === null) {
      if (props.errors !== undefined)
        props.errors.push(
          ...Array.from(mismatches).map(
            (key) => `${JSON.stringify(key)}: failed to find reference type.`,
          ),
        );
      return null;
    } else if (OpenApiTypeChecker.isObject(entity) === false) {
      if (props.errors !== undefined)
        props.errors.push(
          `${props.accessor ?? "$input"}: LLM only accepts object type as parameters.`,
        );
      return null;
    }
    return entity;
  };
}
