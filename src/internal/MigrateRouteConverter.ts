import { IMigrateRoute } from "../IMigrateRoute";
import { OpenApi } from "../OpenApi";
import { Escaper } from "../utils/Escaper";
import { StringUtil } from "../utils/StringUtil";
import { OpenApiTypeChecker } from "./OpenApiTypeChecker";

export namespace MigrateRouteConverter {
  export interface IProps {
    document: OpenApi.IDocument;
    method: "head" | "get" | "post" | "put" | "patch" | "delete";
    path: string;
    emendedPath: string;
    operation: OpenApi.IOperation;
  }
  export const convert = (props: IProps): IMigrateRoute | string[] => {
    //----
    // REQUEST AND RESPONSE BODY
    //----
    const body: false | null | IMigrateRoute.IBody = emplaceBodySchema(
      "request",
    )((schema) =>
      emplaceReference({
        document: props.document,
        name: "body",
        schema,
      }),
    )(props.operation.requestBody);
    const success: false | null | IMigrateRoute.IBody = emplaceBodySchema(
      "response",
    )((schema) =>
      emplaceReference({
        document: props.document,
        name: "response",
        schema,
      }),
    )(
      props.operation.responses?.["201"] ??
        props.operation.responses?.["200"] ??
        props.operation.responses?.default,
    );

    const failures: string[] = [];
    if (body === false)
      failures.push(
        `supports only "application/json", "application/x-www-form-urlencoded", "multipart/form-data" and "text/plain" content type in the request body.`,
      );
    if (success === false)
      failures.push(
        `supports only "application/json", "application/x-www-form-urlencoded" and "text/plain" content type in the response body.`,
      );

    //----
    // HEADERS AND QUERY
    //---
    const [headers, query] = ["header", "query"].map((type) => {
      // FIND TARGET PARAMETERS
      const parameters: OpenApi.IOperation.IParameter[] = (
        props.operation.parameters ?? []
      ).filter((p) => p.in === type);
      if (parameters.length === 0) return null;

      // CHECK PARAMETER TYPES -> TO BE OBJECT
      const objects = parameters
        .map((p) =>
          OpenApiTypeChecker.isObject(p.schema)
            ? p.schema
            : OpenApiTypeChecker.isReference(p.schema) &&
                OpenApiTypeChecker.isObject(
                  props.document.components.schemas?.[
                    p.schema.$ref.replace(`#/components/schemas/`, ``)
                  ] ?? {},
                )
              ? p.schema
              : null!,
        )
        .filter((s) => !!s);
      const primitives = parameters.filter(
        (p) =>
          OpenApiTypeChecker.isBoolean(p.schema) ||
          OpenApiTypeChecker.isInteger(p.schema) ||
          OpenApiTypeChecker.isNumber(p.schema) ||
          OpenApiTypeChecker.isString(p.schema) ||
          OpenApiTypeChecker.isArray(p.schema),
      );
      if (objects.length === 1 && primitives.length === 0) return objects[0];
      else if (objects.length > 1) {
        failures.push(`${type} typed parameters must be only one object type`);
        return false;
      }

      // GATHER TO OBJECT TYPE
      const dto: OpenApi.IJsonSchema.IObject | null = objects[0]
        ? OpenApiTypeChecker.isObject(objects[0])
          ? objects[0]
          : ((props.document.components.schemas ?? {})[
              (objects[0] as OpenApi.IJsonSchema.IReference).$ref.replace(
                `#/components/schemas/`,
                ``,
              )
            ] as OpenApi.IJsonSchema.IObject)
        : null;
      const entire: OpenApi.IJsonSchema.IObject[] = [
        ...objects.map((o) =>
          OpenApiTypeChecker.isObject(o)
            ? o
            : (props.document.components.schemas?.[
                o.$ref.replace(`#/components/schemas/`, ``)
              ]! as OpenApi.IJsonSchema.IObject),
        ),
        {
          type: "object",
          properties: Object.fromEntries([
            ...primitives.map((p) => [
              p.name,
              {
                ...p.schema,
                description: p.schema.description ?? p.description,
              },
            ]),
            ...(dto ? Object.entries(dto.properties ?? {}) : []),
          ]),
          required: [
            ...primitives.filter((p) => p.required).map((p) => p.name!),
            ...(dto ? dto.required ?? [] : []),
          ],
        },
      ];
      return parameters.length === 0
        ? null
        : emplaceReference({
            document: props.document,
            name:
              StringUtil.pascal(`I/Api/${props.path}`) +
              "." +
              StringUtil.pascal(`${props.method}/${type}`),
            schema: {
              type: "object",
              properties: Object.fromEntries([
                ...new Map<string, OpenApi.IJsonSchema>(
                  entire
                    .map((o) =>
                      Object.entries(o.properties ?? {}).map(
                        ([name, schema]) =>
                          [
                            name,
                            {
                              ...schema,
                              description:
                                schema.description ?? schema.description,
                            } as OpenApi.IJsonSchema,
                          ] as const,
                      ),
                    )
                    .flat(),
                ),
              ]),
              required: [
                ...new Set(entire.map((o) => o.required ?? []).flat()),
              ],
            },
          });
    });

    //----
    // PATH PARAMETERS
    //----
    const parameterNames: string[] = StringUtil.splitWithNormalization(
      props.emendedPath,
    )
      .filter((str) => str[0] === ":")
      .map((str) => str.substring(1));
    const pathParameters: OpenApi.IOperation.IParameter[] = (
      props.operation.parameters ?? []
    ).filter((p) => p.in === "path");
    if (parameterNames.length !== pathParameters.length)
      if (
        pathParameters.length < parameterNames.length &&
        pathParameters.every(
          (p) => p.name !== undefined && parameterNames.includes(p.name),
        )
      ) {
        for (const name of parameterNames)
          if (pathParameters.find((p) => p.name === name) === undefined)
            pathParameters.push({
              name,
              in: "path",
              schema: { type: "string" },
            });
        pathParameters.sort(
          (a, b) =>
            parameterNames.indexOf(a.name!) - parameterNames.indexOf(b.name!),
        );
        props.operation.parameters = [
          ...pathParameters,
          ...(props.operation.parameters ?? []).filter((p) => p.in !== "path"),
        ];
      } else
        failures.push(
          "number of path parameters are not matched with its full path.",
        );
    if (failures.length) return failures;

    return {
      method: props.method,
      path: props.path,
      emendedPath: props.emendedPath,
      accessor: ["@lazy"],
      headers: headers
        ? {
            name: "headers",
            key: "headers",
            schema: headers,
          }
        : null,
      parameters: (props.operation.parameters ?? [])
        .filter((p) => p.in === "path")
        .map((p, i) => ({
          // FILL KEY NAME IF NOT EXISTsS
          name: parameterNames[i],
          key: (() => {
            let key: string = StringUtil.normalize(parameterNames[i]);
            if (Escaper.variable(key)) return key;
            while (true) {
              key = "_" + key;
              if (!parameterNames.some((s) => s === key)) return key;
            }
          })(),
          schema: {
            ...p!.schema,
            description: p!.schema.description ?? p!.description,
          },
        })),
      query: query
        ? {
            name: "query",
            key: "query",
            schema: query,
          }
        : null,
      body: body as IMigrateRoute.IBody | null,
      success: success as IMigrateRoute.IBody | null,
      exceptions: Object.fromEntries(
        Object.entries(props.operation.responses ?? {})
          .filter(
            ([key]) => key !== "200" && key !== "201" && key !== "default",
          )
          .map(([key, value]) => [
            key,
            {
              description: value.description,
              schema: value.content?.["application/json"]?.schema ?? {},
            },
          ]),
      ),
      comment: () => writeDescription(props.operation),
      operation: () => props.operation,
    };
  };

  const writeDescription = (original: OpenApi.IOperation): string => {
    const commentTags: string[] = [];
    const add = (text: string) => {
      if (commentTags.every((line) => line !== text)) commentTags.push(text);
    };

    let description: string = original.description ?? "";
    if (original.summary) {
      const emended: string = original.summary.endsWith(".")
        ? original.summary
        : original.summary + ".";
      if (!!description.length && !description.startsWith(original.summary))
        description = `${emended}\n${description}`;
    }
    for (const p of original.parameters ?? [])
      if (p.description) add(`@param ${p.name} ${p.description}`);
    if (original.requestBody?.description)
      add(`@param body ${original.requestBody.description}`);
    for (const security of original.security ?? [])
      for (const [name, scopes] of Object.entries(security))
        add(`@security ${[name, ...scopes].join("")}`);
    if (original.tags) original.tags.forEach((name) => add(`@tag ${name}`));
    if (original.deprecated) add("@deprecated");
    return description.length
      ? commentTags.length
        ? `${description}\n\n${commentTags.join("\n")}`
        : description
      : commentTags.join("\n");
  };

  const emplaceBodySchema =
    (from: "request" | "response") =>
    (
      emplacer: (schema: OpenApi.IJsonSchema) => OpenApi.IJsonSchema.IReference,
    ) =>
    (meta?: {
      description?: string;
      content?: Partial<Record<string, OpenApi.IOperation.IMediaType>>; // ISwaggerRouteBodyContent;
      "x-nestia-encrypted"?: boolean;
    }): false | null | IMigrateRoute.IBody => {
      if (!meta?.content) return null;

      const entries: [string, OpenApi.IOperation.IMediaType][] = Object.entries(
        meta.content,
      ).filter(([_, v]) => !!v?.schema) as [
        string,
        OpenApi.IOperation.IMediaType,
      ][];
      const json = entries.find((e) =>
        meta["x-nestia-encrypted"] === true
          ? e[0].includes("text/plain") || e[0].includes("application/json")
          : e[0].includes("application/json") || e[0].includes("*/*"),
      );
      if (json) {
        const { schema } = json[1];
        return {
          type: "application/json",
          name: "body",
          key: "body",
          schema: schema
            ? isNotObjectLiteral(schema)
              ? schema
              : emplacer(schema)
            : {},
          "x-nestia-encrypted": meta["x-nestia-encrypted"],
        };
      }

      const query = entries.find((e) =>
        e[0].includes("application/x-www-form-urlencoded"),
      );
      if (query) {
        const { schema } = query[1];
        return {
          type: "application/x-www-form-urlencoded",
          name: "body",
          key: "body",
          schema: schema
            ? isNotObjectLiteral(schema)
              ? schema
              : emplacer(schema)
            : {},
        };
      }

      const text = entries.find((e) => e[0].includes("text/plain"));
      if (text)
        return {
          type: "text/plain",
          name: "body",
          key: "body",
          schema: { type: "string" },
        };

      if (from === "request") {
        const multipart = entries.find((e) =>
          e[0].includes("multipart/form-data"),
        );
        if (multipart) {
          const { schema } = multipart[1];
          return {
            type: "multipart/form-data",
            name: "body",
            key: "body",
            schema: schema
              ? isNotObjectLiteral(schema)
                ? schema
                : emplacer(schema)
              : {},
          };
        }
      }
      return false;
    };

  const emplaceReference = (props: {
    document: OpenApi.IDocument;
    name: string;
    schema: OpenApi.IJsonSchema;
  }): OpenApi.IJsonSchema.IReference => {
    props.document.components.schemas ??= {};
    props.document.components.schemas[props.name] = props.schema;
    return { $ref: `#/components/schemas/${props.name}` };
  };

  const isNotObjectLiteral = (schema: OpenApi.IJsonSchema): boolean =>
    OpenApiTypeChecker.isReference(schema) ||
    OpenApiTypeChecker.isBoolean(schema) ||
    OpenApiTypeChecker.isNumber(schema) ||
    OpenApiTypeChecker.isString(schema) ||
    OpenApiTypeChecker.isUnknown(schema) ||
    (OpenApiTypeChecker.isOneOf(schema) &&
      schema.oneOf.every(isNotObjectLiteral)) ||
    (OpenApiTypeChecker.isArray(schema) && isNotObjectLiteral(schema.items));
}
