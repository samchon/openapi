import { IMigrateRoute } from "../IMigrateRoute";
import { IMigrateDocument } from "../IMigrateDocument";
import { OpenApi } from "../OpenApi";
import { StringUtil } from "../utils/StringUtil";
import { MigrateRouteConverter } from "./MigrateRouteConverter";
import { MigrateRouteAccessor } from "./MigrateRouteAccessor";

export namespace MigrateConverter {
  export const convert = <
    Schema extends OpenApi.IJsonSchema,
    Operation extends OpenApi.IOperation<Schema>,
  >(
    document: OpenApi.IDocument<Schema, Operation>,
  ): IMigrateDocument<Schema, Operation> => {
    const errors: IMigrateDocument.IError<Operation>[] = [];
    const entire: Array<IMigrateRoute<Schema, Operation> | null> =
      Object.entries({
        ...(document.paths ?? {}),
        ...(document.webhooks ?? {}),
      })
        .map(([path, collection]) =>
          (["head", "get", "post", "put", "patch", "delete"] as const)
            .filter((method) => collection[method] !== undefined)
            .map((method) => {
              const operation: Operation = collection[method]!;
              const migrated: IMigrateRoute<Schema, Operation> | string[] =
                MigrateRouteConverter.convert({
                  document,
                  method,
                  path,
                  emendedPath: StringUtil.reJoinWithDecimalParameters(path),
                  operation,
                }) as IMigrateRoute<Schema, Operation> | string[];
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
    const operations: IMigrateRoute<Schema, Operation>[] = entire.filter(
      (o): o is IMigrateRoute<Schema, Operation> => !!o,
    );
    MigrateRouteAccessor.overwrite(operations);
    return {
      routes: operations,
      errors,
    };
  };
}
