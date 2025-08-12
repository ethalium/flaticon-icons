/**
 * Defines the permissible font options for a flat icon.
 *
 * The `FlatIconFont` type represents a set of predefined string literals
 * that specify the font of a flat icon.
 */
export type FlatIconFont =
  | "bold-rounded"
  | "bold-straight"
  | "brands"
  | "duotone-chubby"
  | "duotone-rounded"
  | "duotone-straight"
  | "regular-chubby"
  | "regular-rounded"
  | "regular-straight"
  | "solid-chubby"
  | "solid-rounded"
  | "solid-straight"
  | "thin-chubby"
  | "thin-rounded"
  | "thin-straight";

/**
 * Defines the permissible weight options for a flat icon.
 *
 * The `FlatIconFamily` type represents a set of predefined string literals
 * that specify the weight or thickness of a flat icon. This can be used
 * to style or customize the appearance of an icon.
 */
export type FlatIconFamily = "brands" | "chubby" | "rounded" | "straight";

/**
 * Represents the weight of a flat icon.
 *
 * This type defines the visual weight or category of an icon, determining
 * its overall appearance or classification.
 */
export type FlatIconWeight = "bold" | "duotone" | "regular" | "solid" | "thin";

/**
 * Represents a collection of flat icons where each icon is identified by a unique string key.
 * Each key corresponds to a detailed icon specification.
 *
 * This type is used to define an icon registry or catalog where multiple icons can
 * be mapped and referenced using string identifiers.
 *
 * The structure of a single icon detail is determined by the `FlatIcon` type.
 */
export type FlatIcons = Record<string, FlatIcon>;

/**
 * Represents a flat icon
 * It includes additional attributes for icon variations in terms of families, styles and weights.
 *
 * @interface FlatIcon
 *
 * @property {string} name - Name of the flat icon
 * @property {string} description - Description of the flat icon
 * @property {Record<FlatIconFont, string>} classes - Class identifiers for each font of the icon
 * @property {string[]} tags - Tags associated with the icon
 */
export interface FlatIcon {
  name: string;
  description: string;
  classes: { [key in FlatIconFont]?: string };
  tags: string[];
}
