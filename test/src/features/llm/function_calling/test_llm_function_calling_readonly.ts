import typia, { tags } from "typia";
import { v4 } from "uuid";

import { ILlmApplication } from "../../../../../lib";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_llm_function_calling_readonly = () =>
  validate_llm_function_calling_readonly({
    vendor: "anthropic/claude-sonnet-4.5",
  });

const validate_llm_function_calling_readonly = async (props: {
  vendor: string;
}) => {
  const application: ILlmApplication = LlmApplicationFactory.convert({
    application: typia.json.application<IApplication>(),
  });
  for (const p of [
    application.functions[0].parameters.properties.id,
    application.functions[0].parameters.properties.created_at,
  ])
    (p as any).readOnly = true;
  return await LlmFunctionCaller.test({
    vendor: props.vendor,
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

  The member's id is "${v4()}", and the account's email is "john@doe.com".
  The account has been created at "2023-01-01T00:00:00.000Z" 
  and the member's name is "John Doe".
`;
