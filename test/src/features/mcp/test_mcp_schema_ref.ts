import { TestValidator } from "@nestia/e2e";
import {
  ChatGptTypeChecker,
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  IMcpLlmApplication,
  LlamaTypeChecker,
  McpLlm,
} from "@samchon/openapi";

export const test_mcp_schema_ref = async (): Promise<void> => {
  const http: IHttpLlmApplication<"chatgpt"> = HttpLlm.application({
    model: "chatgpt",
    document: await fetch(
      "https://raw.githubusercontent.com/samchon/shopping-backend/refs/heads/master/packages/api/swagger.json",
    ).then((r) => r.json()),
    options: {
      reference: true,
    },
  });
  const func: IHttpLlmFunction<"chatgpt"> | undefined = http.functions.find(
    (x) =>
      Object.keys(x.parameters.$defs).length !== 0 &&
      Object.keys(x.parameters.properties).length !== 0 &&
      x.parameters.properties.body !== undefined &&
      false ===
        isEmptyBody(x.parameters.$defs, x.parameters.properties.body ?? {}),
  );
  if (func === undefined) throw new Error("Function not found");

  const visited: Set<string> = new Set<string>();
  ChatGptTypeChecker.visit({
    closure: (schema) => {
      if (ChatGptTypeChecker.isReference(schema))
        visited.add(schema.$ref.split("/").pop()!);
    },
    $defs: func.parameters.$defs,
    schema: func.parameters,
  });

  const mcp: IMcpLlmApplication<"chatgpt"> = McpLlm.application({
    model: "chatgpt",
    tools: [
      {
        name: func.name,
        description: func.description,
        inputSchema: func.parameters,
      },
    ],
    options: {
      reference: true,
    },
  });
  TestValidator.equals(
    "schema",
    (key) => key === "description",
  )({
    ...func.parameters,
    $defs: Object.fromEntries(
      Object.entries(func.parameters.$defs).filter(([key]) => visited.has(key)),
    ),
  })(mcp.functions[0].parameters);
};

const isEmptyBody = ($defs: Record<string, any>, input: any): boolean => {
  if (LlamaTypeChecker.isReference(input)) {
    const name: string = input.$ref.split("/").pop()!;
    return $defs[name] && isEmptyBody($defs, $defs[name]);
  }
  return (
    LlamaTypeChecker.isObject(input) &&
    Object.keys(input.properties ?? {}).length === 0
  );
};
