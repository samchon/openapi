import { tags } from "typia";

/**
 * Descriptive option.
 *
 * When type of the option not `"select"`, it means the option is descriptive
 * that requiring {@link IShoppingCustomer customers} to write some value to
 * {@link IShoppingOrder purchase}. Also, whatever customer writes about the
 * option, it does not affect the {@link IShoppingSaleUnitStock final stock}.
 *
 * Another words, the descriptive option is just for information transfer.
 *
 * @author Samchon
 */
export interface IShoppingSaleUnitDescriptiveOption
  extends IShoppingSaleUnitDescriptiveOption.ICreate {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;
}
export namespace IShoppingSaleUnitDescriptiveOption {
  /**
   * Creation information of the descriptive option.
   */
  export interface ICreate {
    /**
     * Type of descriptive option.
     *
     * Which typed value should be written when purchasing.
     */
    type: "boolean" | "number" | "string";

    /**
     * Readable name of the option.
     */
    name: string;
  }
}
