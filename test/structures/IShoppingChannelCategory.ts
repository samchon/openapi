import { tags } from "typia";

/**
 * Category of channel.
 *
 * `IShoppingChannelCategory` is a concept that refers to classification
 * categories within a specific {@link IShoppingChannel channel}, and is exactly
 * the same as the concept commonly referred to as "category" in shopping malls.
 *
 * And `IShoppingChannelCategory` is different with {@link IShoppingSection}.
 * {@link IShoppingSection} refers to a "corner" that is independent spatial
 * information in the offline market, which cannot simultaneously classified in
 * a {@link IShoppingSale sale}. Besides, `IShoppingChannelCategory` can be
 * classified into multiple categories in a sale simultaneously.
 *
 * Product	| Section (corner) | Categories
 * ---------|------------------|-----------------------------------
 * Beef	    | Butcher corner   | Frozen food, Meat, Favorite food
 * Grape    | Fruit corner     | Fresh food, Favorite food
 *
 * In addition, as `IShoppingChannelCategory` has 1:N self recursive relationship,
 * it is possible to express below hierarchical structures. Thus, each channel
 * can set their own category classification as they want.
 *
 * - Food > Meat > Frozen
 * - Electronics > Notebook > 15 inches
 * - Miscellaneous > Wallet
 *
 * Furthermore, `IShoppingChannelCategory` is designed to merge between themselves,
 * so there is no burden to edit the category at any time.
 *
 * @author Samchon
 */
export interface IShoppingChannelCategory
  extends IShoppingChannelCategory.IHierarchical {
  /**
   * Parent category info.
   */
  parent: null | IShoppingChannelCategory.IInvert;
}
export namespace IShoppingChannelCategory {
  /**
   * Hierarchical category information with children categories.
   */
  export interface IHierarchical extends IBase {
    /**
     * List of children categories with hierarchical structure.
     */
    children: IHierarchical[];
  }

  /**
   * Invert category information with parent category.
   */
  export interface IInvert extends IBase {
    /**
     * Parent category info with recursive structure.
     *
     * If no parent exists, then be `null`.
     */
    parent: null | IShoppingChannelCategory.IInvert;
  }

  /**
   * Basic information of the category.
   */
  export interface IBase {
    /**
     * Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Parent category's ID.
     */
    parent_id: null | (string & tags.Format<"uuid">);

    /**
     * Identifier code of the category.
     */
    code: string & tags.Pattern<"^[a-z0-9_]+$">;

    /**
     * Representative name of the category.
     *
     * The name must be unique within the parent category. If no parent exists,
     * then the name must be unique within the channel between no parent
     * categories.
     */
    name: string;

    /**
     * Creation time of record.
     */
    created_at: string & tags.Format<"date-time">;
  }

  /**
   * Creation information of the category.
   */
  export interface ICreate {
    /**
     * Parent category's ID.
     */
    parent_id: null | (string & tags.Format<"uuid">);

    /**
     * Identifier code of the category.
     */
    code: string & tags.Pattern<"^[a-z0-9_]+$">;

    /**
     * Representative name of the category.
     *
     * The name must be unique within the parent category. If no parent exists,
     * then the name must be unique within the channel between no parent
     * categories.
     */
    name: string;
  }

  /**
   * Updating information of the category.
   */
  export type IUpdate = ICreate;
}
