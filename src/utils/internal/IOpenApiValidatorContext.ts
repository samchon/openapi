import { OpenApi } from "../../OpenApi";
import { IValidation } from "../../structures/IValidation";

export interface IOpenApiValidatorContext<Schema extends OpenApi.IJsonSchema> {
  components: OpenApi.IComponents;
  schema: Schema;
  value: unknown;
  path: string;
  report: (exceptional: boolean, error: IValidation.IError) => boolean;
  exceptional: boolean;
  expected?: string;
  required: boolean;
}
