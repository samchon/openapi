import { IMigrateRoute } from "../IMigrateRoute";
import { IMigrateDocument } from "../IMigrateDocument";
import { OpenApi } from "../OpenApi";
import { StringUtil } from "../utils/StringUtil";
import { MigrateOperationConverter } from "./MigrateOperationConverter";
import { MigrateRouteNamespacer } from "./MigrateRouteNamespacer";

export namespace MigrateConverter {
  export const convert = (document: OpenApi.IDocument): IMigrateDocument => {
    const errors: IMigrateDocument.IError[] = [];
    const entire: Array<IMigrateRoute | null> = Object.entries(
      document.paths ?? {},
    )
      .map(([path, collection]) =>
        (["head", "get", "post", "put", "patch", "delete"] as const)
          .filter((method) => collection[method] !== undefined)
          .map((method) => {
            const operation: OpenApi.IOperation = collection[method]!;
            const migrated: IMigrateRoute | string[] =
              MigrateOperationConverter.convert({
                document,
                method,
                path,
                emendedPath: StringUtil.reJoinWithDecimalParameters(path),
                operation,
              });
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
    const operations: IMigrateRoute[] = entire.filter(
      (o): o is IMigrateRoute => !!o,
    );
    MigrateRouteNamespacer.overwrite(operations);
    return {
      routes: operations,
      errors,
    };
  };
}
