import typia, { tags } from "typia";
import { v4 } from "uuid";

import { ILlmApplication, ILlmSchema } from "../../../../../lib";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_chatgpt_function_calling_strict_readonly = () =>
  validate_llm_function_calling_readonly({
    vendor: "openai/gpt-4.1",
    model: "chatgpt",
    config: {
      reference: true,
      strict: true,
    },
  });

export const test_chatgpt_function_calling_readonly = () =>
  validate_llm_function_calling_readonly({
    vendor: "openai/gpt-4.1",
    model: "chatgpt",
  });

export const test_claude_function_calling_readonly = () =>
  validate_llm_function_calling_readonly({
    vendor: "anthropic/claude-sonnet-4.5",
    model: "claude",
  });

export const test_deepseek_function_calling_readonly = () =>
  validate_llm_function_calling_readonly({
    vendor: "deepseek/deepseek-v3.1-terminus:exacto",
    model: "claude",
  });

export const test_gemini_function_calling_readonly = () =>
  validate_llm_function_calling_readonly({
    vendor: "google/gemini-2.5-pro",
    model: "gemini",
  });

export const test_llama_function_calling_readonly = () =>
  validate_llm_function_calling_readonly({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    model: "claude",
  });

const validate_llm_function_calling_readonly = async <
  Model extends ILlmSchema.Model,
>(props: {
  vendor: string;
  model: Model;
  config?: ILlmSchema.IConfig<Model>;
}) => {
  const application: ILlmApplication<Model> =
    LlmApplicationFactory.convert<Model>({
      model: props.model,
      application: typia.json.application<IApplication>(),
      config: props.config,
    });
  for (const p of [
    application.functions[0].parameters.properties.id,
    application.functions[0].parameters.properties.created_at,
  ])
    (p as any).readOnly = true;
  return await LlmFunctionCaller.test({
    vendor: props.vendor,
    model: props.model,
    function: application.functions[0],
    texts: [
      {
        role: "assistant",
        content: SYSTEM_MESSAGE,
      },
      {
        role: "user",
        content: USER_MESSAGE,
      },
    ],
    handleParameters: async () => {},
    handleCompletion: async () => {},
    strict: (props.config as any)?.strict,
  });
};

interface IApplication {
  participate(member: IMember): void;
}
interface IMember {
  readonly id: string & tags.Format<"uuid">;
  email: string & tags.Format<"email">;
  name: string;
  readonly created_at: string & tags.Format<"date-time">;
}

const SYSTEM_MESSAGE = `You are a helpful assistant for function calling.`;
const USER_MESSAGE = `
  A new member wants to participate.

  The member's id is "${v4()}, and the account's email is "john@doe.com".
  The account has been created at "2023-01-01T00:00:00.000Z" 
  and the member's name is "John Doe".
`;
