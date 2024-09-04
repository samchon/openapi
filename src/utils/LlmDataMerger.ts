import { IHttpLlmFunction } from "../structures/IHttpLlmFunction";
import { ILlmFunction } from "../structures/ILlmFunction";

/**
 * Data combiner for LLM function call.
 *
 * @author Samchon
 */
export namespace LlmDataMerger {
  /**
   * Properties of {@link parameters} function.
   */
  export interface IProps {
    /**
     * Target function to call.
     */
    function: ILlmFunction;

    /**
     * Arguments composed by LLM (Large Language Model).
     */
    llm: any[];

    /**
     * Arguments composed by human.
     */
    human: any[];
  }

  /**
   * Combine LLM and human arguments into one.
   *
   * When you composes {@link IOpenAiDocument} with
   * {@link IOpenAiDocument.IOptions.separate} option, then the arguments of the
   * target function would be separated into two parts; LLM (Large Language Model)
   * and human.
   *
   * In that case, you can combine both LLM and human composed arguments into one
   * by utilizing this {@link LlmDataMerger.parameters} function, referencing
   * the target function metadata {@link IOpenAiFunction.separated}.
   *
   * @param props Properties to combine LLM and human arguments with metadata.
   * @returns Combined arguments
   */
  export const parameters = (props: IProps): unknown[] => {
    const separated: IHttpLlmFunction.ISeparated | undefined =
      props.function.separated;
    if (separated === undefined)
      throw new Error(
        "Error on OpenAiDataComposer.parameters(): the function parameters are not separated.",
      );
    return new Array(props.function.parameters.length).fill(0).map((_, i) => {
      const llm: number = separated.llm.findIndex((p) => p.index === i);
      const human: number = separated.human.findIndex((p) => p.index === i);
      if (llm === -1 && human === -1)
        throw new Error(
          "Error on OpenAiDataComposer.parameters(): failed to gather separated arguments, because both LLM and human sides are all empty.",
        );
      return value(props.llm[llm], props.human[human]);
    });
  };

  /**
   * Combine two values into one.
   *
   * If both values are objects, then combines them in the properties level.
   *
   * Otherwise, returns the latter value if it's not null, otherwise the former value
   *
   * - `return (y ?? x)`
   *
   * @param x Value X
   * @param y Value Y
   * @returns Combined value
   */
  export const value = (x: unknown, y: unknown): unknown =>
    typeof x === "object" && typeof y === "object" && x !== null && y !== null
      ? combineObject(x, y)
      : Array.isArray(x) && Array.isArray(y)
        ? new Array(Math.max(x.length, y.length))
            .fill(0)
            .map((_, i) => value(x[i], y[i]))
        : y ?? x;

  const combineObject = (x: any, y: any): any => {
    const output: any = { ...x };
    for (const [k, v] of Object.entries(y)) output[k] = value(x[k], v);
    return output;
  };
}
