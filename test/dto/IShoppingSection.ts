import { tags } from "typia";

/**
 * Section information.
 *
 * `IShoppingSection` is a concept that refers to the spatial information of
 * the market.
 *
 * If we compare the section mentioned here to the offline market, it means a
 * spatially separated area within the store, such as the "fruit corner" or
 * "butcher corner". Therefore, in the {@link IShoppingSale sale} entity, it is
 * not possible to classify multiple sections simultaneously, but only one section
 * can be classified.
 *
 * By the way, if your shopping mall system requires only one section, then just
 * use only one. This concept is designed to be expandable in the future.
 *
 * @author Samchon
 */
export interface IShoppingSection {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Identifier code.
   */
  code: string;

  /**
   * Representative name of the section.
   */
  name: string;

  /**
   * Creation time of record.
   */
  created_at: string & tags.Format<"date-time">;
}
