import { OpenApi } from "../../OpenApi";
import { IHttpMigrateApplication } from "../../structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "../../structures/IHttpMigrateRoute";
import { StringUtil } from "../../utils/StringUtil";
import { HttpMigrateApplicationComposer } from "../HttpMigrateApplicationComposer";
import { MigrateRouteAccessor } from "./MigrateRouteAccessor";

export namespace MigrateConverter {
  export const convert = (
    document: OpenApi.IDocument,
  ): IHttpMigrateApplication => {
    const errors: IHttpMigrateApplication.IError[] = [];
    const entire: Array<IHttpMigrateRoute | null> = Object.entries({
      ...(document.paths ?? {}),
      ...(document.webhooks ?? {}),
    })
      .map(([path, collection]) =>
        (["head", "get", "post", "put", "patch", "delete"] as const)
          .filter((method) => collection[method] !== undefined)
          .map((method) => {
            const operation: OpenApi.IOperation = collection[method]!;
            const migrated: IHttpMigrateRoute | string[] =
              HttpMigrateApplicationComposer.application({
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
    const operations: IHttpMigrateRoute[] = entire.filter(
      (o): o is IHttpMigrateRoute => !!o,
    );
    MigrateRouteAccessor.overwrite(operations);
    return {
      document: () => document,
      routes: operations,
      errors,
    } satisfies IHttpMigrateApplication as IHttpMigrateApplication;
  };
}
