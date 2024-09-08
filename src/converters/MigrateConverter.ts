import { OpenApi } from "../OpenApi";
import { IHttpMigrateApplication } from "../structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { StringUtil } from "../utils/StringUtil";
import { MigrateRouteAccessor } from "./MigrateRouteAccessor";
import { MigrateRouteConverter } from "./MigrateRouteConverter";

export namespace MigrateConverter {
  export const convert = <
    Schema extends OpenApi.IJsonSchema,
    Operation extends OpenApi.IOperation<Schema>,
  >(
    document: OpenApi.IDocument<Schema, Operation>,
  ): IHttpMigrateApplication<Schema, Operation> => {
    const errors: IHttpMigrateApplication.IError<Operation>[] = [];
    const entire: Array<IHttpMigrateRoute<Schema, Operation> | null> =
      Object.entries({
        ...(document.paths ?? {}),
        ...(document.webhooks ?? {}),
      })
        .map(([path, collection]) =>
          (["head", "get", "post", "put", "patch", "delete"] as const)
            .filter((method) => collection[method] !== undefined)
            .map((method) => {
              const operation: Operation = collection[method]!;
              const migrated: IHttpMigrateRoute<Schema, Operation> | string[] =
                MigrateRouteConverter.convert({
                  document,
                  method,
                  path,
                  emendedPath: StringUtil.reJoinWithDecimalParameters(path),
                  operation,
                }) as IHttpMigrateRoute<Schema, Operation> | string[];
              if (Array.isArray(migrated)) {
                errors.push({
                  method,
                  path,
                  operation: () => operation,
                  messages: migrated,
                });
                return null;
              }
              return migrated;
            }),
        )
        .flat();
    const operations: IHttpMigrateRoute<Schema, Operation>[] = entire.filter(
      (o): o is IHttpMigrateRoute<Schema, Operation> => !!o,
    );
    MigrateRouteAccessor.overwrite(operations);
    return {
      document: () => document,
      routes: operations,
      errors,
    };
  };
}
