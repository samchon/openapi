import { tags } from "typia";

import { IShoppingSaleSnapshot } from "./IShoppingSaleSnapshot";
import { IShoppingSection } from "./IShoppingSection";

/**
 * Seller sales products.
 *
 * `IShoppingSale` is an entity that embodies "product sales" (sales)
 * information registered by the {@link ISoppingSeller seller}. And the main
 * information of the sale is recorded in the sub {@link IShoppingSaleSnapshot},
 * not in the main `IShoppingSale`. When a seller changes a previously registered
 * item, the existing `IShoppingSale` record is not changed, but a new
 * {@link IShoppingSaleSnapshot snapshot} record be created.
 *
 * This is to preserve the {@link IShoppingCustomer customer}'s
 * {@link IShoppingOrder purchase history} flawlessly after the customer
 * purchases a specific item, even if the seller changes the components or
 * price of the item. It is also intended to support sellers in so-called A/B
 * testing, which involves changing components or prices and measuring the
 * performance in each case.
 *
 * @author Samchon
 */
export interface IShoppingSale
  extends IShoppingSaleSnapshot,
    IShoppingSale.ITimestamps {
  /**
   * Belonged section.
   */
  section: IShoppingSection;
}
export namespace IShoppingSale {
  /**
   * Definitions of timepoints of sale.
   */
  export interface ITimestamps {
    /**
     * Creation time of the record.
     *
     * Note that, this property is different with {@link opened_at},
     * which means the timepoint of the sale is opened.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Last updated time of the record.
     *
     * In another words, creation time of the last snapshot.
     */
    updated_at: string & tags.Format<"date-time">;

    /**
     * Paused time of the sale.
     *
     * The sale is paused by the seller, for some reason.
     *
     * {@link IShoppingCustomer Customers} can still see the sale on the
     * both list and detail pages, but the sale has a warning label
     * "The sale is paused by the seller".
     */
    paused_at: null | (string & tags.Format<"date-time">);

    /**
     * Suspended time of the sale.
     *
     * The sale is suspended by the seller, for some reason.
     *
     * {@link IShoppingCustomer Customers} cannot see the sale on the
     * both list and detail pages. It is almost same with soft delettion,
     * but there's a little bit difference that the owner
     * {@link IShoppingSeller seller} can still see the sale and resume it.
     *
     * Of course, the {@link IShoppingCustomer customers} who have
     * already purchased the sale can still see the sale on the
     * {@link IShoppingOrder order} page.
     */
    suspended_at: null | (string & tags.Format<"date-time">);

    /**
     * Opening time of the sale.
     */
    opened_at: null | (string & tags.Format<"date-time">);

    /**
     * Closing time of the sale.
     *
     * If this value is `null`, the sale be continued forever.
     */
    closed_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Summarized information of sale.
   *
   * This summarized information being used for pagination.
   */
  export interface ISummary
    extends IShoppingSaleSnapshot.ISummary,
      ITimestamps {
    /**
     * Belonged section.
     */
    section: IShoppingSection;
  }

  /**
   * Creation information of sale.
   */
  export interface ICreate extends IShoppingSaleSnapshot.ICreate {
    /**
     * Belonged section's {@link IShoppingSection.code}.
     */
    section_code: string;

    /**
     * Initial status of the sale.
     *
     * `null` or `undefined`: No restriction
     * `paused`: Starts with {@link ITimestamps.paused_at paused} status
     * `suspended`: Starts with {@link ITimestamps.suspended_at suspended} status
     */
    status?: null | "paused" | "suspended";

    /**
     * Opening time of the sale.
     */
    opened_at: null | string; // (string & tags.Format<"date-time">);

    /**
     * Closing time of the sale.
     *
     * If this value is `null`, the sale be continued forever.
     */
    closed_at: null | string; // (string & tags.Format<"date-time">);
  }

  /**
   * Update information of sale.
   */
  export type IUpdate = IShoppingSaleSnapshot.ICreate;

  /**
   * Update opening time information of sale.
   */
  export interface IUpdateOpeningTime {
    /**
     * Opening time of the sale.
     */
    opened_at: null | (string & tags.Format<"date-time">);

    /**
     * Closing time of the sale.
     *
     * If this value is `null`, the sale be continued forever.
     */
    closed_at: null | (string & tags.Format<"date-time">);
  }
}
