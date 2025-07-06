import { OpenApi } from "../../OpenApi";
import { IDeepSeekSchema } from "../../structures/IDeepSeekSchema";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../structures/IResult";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace DeepSeekSchemaComposer {
  /** @internal */
  export const IS_DEFS = true;

  export const DEFAULT_CONFIG: IDeepSeekSchema.IConfig = {
    reference: true,
  };

  export const parameters = (props: {
    config: IDeepSeekSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IDeepSeekSchema.IParameters, IOpenApiSchemaError> =>
    LlmSchemaV3_1Composer.parameters({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const schema = (props: {
    config: IDeepSeekSchema.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, IDeepSeekSchema>;
    schema: OpenApi.IJsonSchema;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IDeepSeekSchema, IOpenApiSchemaError> =>
    LlmSchemaV3_1Composer.schema({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const separateParameters = (props: {
    parameters: IDeepSeekSchema.IParameters;
    predicate: (schema: IDeepSeekSchema) => boolean;
    convention?: (key: string, type: "llm" | "human") => string;
  }): ILlmFunction.ISeparated<"deepseek"> => {
    const separated: ILlmFunction.ISeparated<"3.1"> =
      LlmSchemaV3_1Composer.separateParameters(props);
    return separated as any as ILlmFunction.ISeparated<"deepseek">;
  };

  export const invert = (props: {
    components: OpenApi.IComponents;
    schema: IDeepSeekSchema;
    $defs: Record<string, IDeepSeekSchema>;
  }): OpenApi.IJsonSchema => LlmSchemaV3_1Composer.invert(props);
}
