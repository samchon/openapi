import { OpenApi } from "../OpenApi";
import { IValidation } from "../structures/IValidation";
import { OpenApiStationValidator } from "./internal/OpenApiStationValidator";

export namespace OpenApiValidator {
  export const create =
    (prop: {
      components: OpenApi.IComponents;
      schema: OpenApi.IJsonSchema;
      required: boolean;
    }) =>
    (value: unknown): IValidation<unknown> =>
      validate({ ...prop, value });

  export const validate = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    value: unknown;
    required: boolean;
  }): IValidation<unknown> => {
    const errors: IValidation.IError[] = [];
    OpenApiStationValidator.validate({
      ...props,
      exceptional: true,
      path: "$input",
      report: createReporter(errors),
    });
    return errors.length === 0
      ? {
          success: true,
          data: props.value,
        }
      : {
          success: false,
          data: props.value,
          errors,
        };
  };

  const createReporter = (array: IValidation.IError[]) => {
    const reportable = (path: string): boolean => {
      if (array.length === 0) return true;
      const last: string = array[array.length - 1]!.path;
      return (
        path.length > last.length || last.substring(0, path.length) !== path
      );
    };
    return (exceptable: boolean, error: IValidation.IError): false => {
      if (exceptable && reportable(error.path)) array.push(error);
      return false;
    };
  };
}
