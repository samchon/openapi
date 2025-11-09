import {
  ILlmApplication,
  ILlmFunction,
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import { IJsonSchemaApplication } from "typia";

import { OpenApiValidator } from "../../../lib/utils/OpenApiValidator";

export namespace LlmApplicationFactory {
  export const convert = <Model extends ILlmSchema.Model>(props: {
    model: Model;
    application: IJsonSchemaApplication;
  }): ILlmApplication<Model> => {
    const options: ILlmSchema.IConfig<Model> = LlmSchemaComposer.defaultConfig(
      props.model,
    );
    return {
      model: props.model,
      functions: props.application.functions.map((func) =>
        convertFunction({
          model: props.model,
          options: options,
          components: props.application.components,
          function: func,
        }),
      ),
      options,
    };
  };

  const convertFunction = <Model extends ILlmSchema.Model>(props: {
    model: Model;
    options: ILlmSchema.IConfig<Model>;
    components: IJsonSchemaApplication.IComponents;
    function: IJsonSchemaApplication.IFunction;
  }): ILlmFunction<Model> => {
    const parameters: IResult<
      ILlmSchema.IParameters<Model>,
      IOpenApiSchemaError
    > = LlmSchemaComposer.parameters(props.model)({
      config: props.options as any,
      components: props.components,
      schema: props.function.parameters[0].schema as any,
    }) satisfies IResult<
      ILlmSchema.IParameters,
      IOpenApiSchemaError
    > as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
    if (parameters.success === false) {
      console.log(JSON.stringify(parameters.error, null, 2));
      throw new Error("Failed to compose parameters schema.");
    }
    const out = (
      schema: ILlmSchema<Model> | undefined,
    ): ILlmFunction<Model> => ({
      name: props.function.name,
      description: props.function.description,
      parameters: parameters.value as any,
      output: schema as any,
      validate: OpenApiValidator.create({
        components: props.components,
        schema: props.function.parameters[0].schema,
        required: true,
      }),
    });
    if (props.function.output === undefined) return out(undefined);

    const output: IResult<
      ILlmSchema<Model>,
      IOpenApiSchemaError
    > = LlmSchemaComposer.schema(props.model)({
      config: props.options as any,
      components: props.components,
      schema: props.function.output.schema,
      $defs: (parameters.value as any).$defs,
    }) satisfies IResult<ILlmSchema, IOpenApiSchemaError> as IResult<
      ILlmSchema<Model>,
      IOpenApiSchemaError
    >;
    if (output.success === false) {
      console.log(JSON.stringify(output.error), null, 2);
      throw new Error("Failed to compose output schema.");
    }
    return out(output.value as any);
  };
}
