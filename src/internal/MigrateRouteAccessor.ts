import { IMigrateRoute } from "../IMigrateRoute";
import { OpenApi } from "../OpenApi";
import { Escaper } from "../utils/Escaper";
import { MapUtil } from "../utils/MapUtil";
import { StringUtil } from "../utils/StringUtil";

export namespace MigrateRouteAccessor {
  export const overwrite = <
    Schema extends OpenApi.IJsonSchema,
    Operation extends OpenApi.IOperation<Schema>,
  >(
    routes: IMigrateRoute<Schema, Operation>[],
  ): void => {
    const dict: Map<string, IElement<Schema, Operation>> = collect((op) =>
      op.emendedPath
        .split("/")
        .filter((str) => !!str.length && str[0] !== ":")
        .map(StringUtil.normalize)
        .map((str) => (Escaper.variable(str) ? str : `_${str}`)),
    )(routes) as Map<string, IElement<Schema, Operation>>;
    for (const props of dict.values())
      props.entries.forEach((entry, i) => {
        entry.alias = StringUtil.escapeDuplicate(
          [
            ...props.children,
            ...props.entries.filter((_, j) => i !== j).map((e) => e.alias),
          ].map(StringUtil.normalize),
        )(StringUtil.normalize(entry.alias));
        entry.route.accessor = [...props.namespace, entry.alias];

        const parameters: { name: string; key: string }[] = [
          ...entry.route.parameters,
          ...(entry.route.body ? [entry.route.body] : []),
          ...(entry.route.headers ? [entry.route.headers] : []),
          ...(entry.route.query ? [entry.route.query] : []),
        ];
        parameters.forEach(
          (p, i) =>
            (p.key = StringUtil.escapeDuplicate([
              "connection",
              entry.alias,
              ...parameters.filter((_, j) => i !== j).map((y) => y.key),
            ])(p.key)),
        );
      });
  };

  const collect =
    <
      Schema extends OpenApi.IJsonSchema,
      Operation extends OpenApi.IOperation<Schema>,
    >(
      getter: (r: IMigrateRoute<Schema, Operation>) => string[],
    ) =>
    (
      routes: IMigrateRoute<Schema, Operation>[],
    ): Map<string, IElement<Schema, Operation>> => {
      const dict: Map<string, IElement<Schema, Operation>> = new Map();
      for (const r of routes) {
        const namespace: string[] = getter(r);
        let last: IElement<Schema, Operation> = MapUtil.take(dict)(
          namespace.join("."),
        )(() => ({
          namespace,
          children: new Set(),
          entries: [],
        }));
        last.entries.push({
          route: r,
          alias: getName(r),
        });
        namespace.slice(0, -1).forEach((_i, i, array) => {
          const partial: string[] = namespace.slice(0, array.length - i);
          const element: IElement<Schema, Operation> = MapUtil.take(dict)(
            partial.join("."),
          )(() => ({
            namespace: partial,
            children: new Set(),
            entries: [],
          }));
          element.children.add(last.namespace.at(-1)!);
        });
        const top = MapUtil.take(dict)("")(() => ({
          namespace: [],
          children: new Set(),
          entries: [],
        }));
        if (namespace.length) top.children.add(namespace[0]);
      }
      return dict;
    };

  const getName = <
    Schema extends OpenApi.IJsonSchema,
    Operation extends OpenApi.IOperation<Schema>,
  >(
    op: IMigrateRoute<Schema, Operation>,
  ): string => {
    const method = op.method === "delete" ? "erase" : op.method;
    if (op.parameters.length === 0) return method;
    return (
      method +
      "By" +
      op.parameters.map((p) => StringUtil.capitalize(p.key)).join("And")
    );
  };

  interface IElement<
    Schema extends OpenApi.IJsonSchema,
    Operation extends OpenApi.IOperation<Schema>,
  > {
    namespace: string[];
    entries: IEntry<Schema, Operation>[];
    children: Set<string>;
  }
  interface IEntry<
    Schema extends OpenApi.IJsonSchema,
    Operation extends OpenApi.IOperation<Schema>,
  > {
    route: IMigrateRoute<Schema, Operation>;
    alias: string;
  }
}
