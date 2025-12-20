import {
  ILlmApplication,
  ILlmFunction,
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import { IJsonSchemaApplication } from "typia";

import { OpenApiValidator } from "../../../lib/utils/OpenApiValidator";

export namespace LlmApplicationFactory {
  export const convert = (props: {
    application: IJsonSchemaApplication;
    config?: Partial<ILlmSchema.IConfig>;
  }): ILlmApplication => {
    const config: ILlmSchema.IConfig = LlmSchemaComposer.getConfig(
      props.config,
    );
    return {
      functions: props.application.functions.map((func) =>
        convertFunction({
          config,
          components: props.application.components,
          function: func,
        }),
      ),
      config: {
        ...config,
        separate: null,
        validate: null,
      },
    };
  };

  const convertFunction = (props: {
    config: ILlmSchema.IConfig;
    components: IJsonSchemaApplication.IComponents;
    function: IJsonSchemaApplication.IFunction;
  }): ILlmFunction => {
    const parameters: IResult<ILlmSchema.IParameters, IOpenApiSchemaError> =
      LlmSchemaComposer.parameters({
        config: props.config,
        components: props.components,
        schema: props.function.parameters[0].schema as
          | OpenApi.IJsonSchema.IObject
          | OpenApi.IJsonSchema.IReference,
      });
    if (parameters.success === false) {
      console.log(JSON.stringify(parameters.error, null, 2));
      throw new Error("Failed to compose parameters schema.");
    }
    const out = (schema: ILlmSchema | undefined): ILlmFunction => ({
      name: props.function.name,
      description: props.function.description,
      parameters: parameters.value,
      output: schema,
      validate: OpenApiValidator.create({
        components: props.components,
        schema: props.function.parameters[0].schema,
        required: true,
      }),
    });
    if (props.function.output === undefined) return out(undefined);

    const output: IResult<ILlmSchema, IOpenApiSchemaError> =
      LlmSchemaComposer.schema({
        config: props.config,
        components: props.components,
        schema: props.function.output.schema,
        $defs: parameters.value.$defs,
      });
    if (output.success === false) {
      console.log(JSON.stringify(output.error, null, 2));
      throw new Error("Failed to compose output schema.");
    }
    return out(output.value);
  };
}
