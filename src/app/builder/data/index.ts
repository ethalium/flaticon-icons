import {Caching} from "../../utils/cache.utils";
import {IBuilderData, IBuilderDataIcons} from "./interfaces/data.interface";
import {deleteDir, sortObjectKeys, writeFile} from "../../utils/common.utils";
import {Vars} from "../../vars";
import {Logger} from "../../utils/logger.utils";
import {BuilderIcons} from "../icons";
import {IBuilderIcons} from "../icons/interfaces/icon.interface";
import {BuilderFonts} from "../fonts";
import {IBuilderFonts} from "../fonts/interfaces/font.interface";
import * as prettier from 'prettier';

const CACHE_KEY = 'data';

export class BuilderData {

  /**
   * Builds a sorted list of font names from the given icon data.
   *
   * @param {IBuilderIcons} icons - The icon data from which font names are extracted.
   * @return {Promise<string[]>} A promise that resolves to a sorted array of font names.
   */
  private static async buildFonts(icons: IBuilderIcons): Promise<string[]> {
    return Object.keys(icons).sort();
  }

  /**
   * Constructs an array of unique icon families from the provided data.
   *
   * @param {IBuilderIcons} icons - An object containing icon information where keys represent icon categories.
   * @return {Promise<string[]>} A promise that resolves to an array of unique icon family names.
   */
  private static async buildFamilies(icons: IBuilderIcons): Promise<string[]> {
    const items: string[] = [];
    for(let key of Object.keys(icons)){
      const family = key === 'brands' ? 'brands' : key.split('-')[1];
      if(!items.includes(family)){
        items.push(family);
      }
    }
    return items.sort();
  }

  /**
   * Asynchronously processes the given data to extract and build a unique list of style identifiers.
   *
   * @param {IBuilderIcons} icons - The input data object containing icon information with keys representing categories or styles.
   * @return {Promise<string[]>} A promise that resolves to an array of unique style names extracted from the input data.
   */
  private static async buildStyles(icons: IBuilderIcons): Promise<string[]> {
    const items: string[] = [];
    for(let key of Object.keys(icons)){
      const style = key === 'brands' ? null : key.split('-')[0];
      if(style && !items.includes(style)){
        items.push(style);
      }
    }
    return items.sort();
  }

  /**
   * Builds a mapping of icons with their corresponding details such as names, descriptions, tags, fonts, and font codes.
   *
   * @param {IBuilderIcons} icons - A collection of icons categorized by fonts, where each font maps to an array of font icon data.
   * @param {IBuilderFonts} fonts - A collection of font metadata containing font codes for each icon.
   * @return {Promise<IBuilderDataIcons>} A promise that resolves to an object containing consolidated icon details including font information and codes.
   */
  private static async buildIcons(icons: IBuilderIcons, fonts: IBuilderFonts): Promise<IBuilderDataIcons> {

    // create object for items
    const items: IBuilderDataIcons = {};

    // build items
    for(const [font, fontIcons] of Object.entries(icons)){
      for(let fontIcon of fontIcons){

        // get font data
        const fontData = fonts[font];

        // create icon font if not exists
        if(!Object.keys(items).includes(fontIcon.name)){
          items[fontIcon.name] = {
            name: fontIcon.name,
            description: fontIcon.description,
            tags: fontIcon.tags,
            classes: {},
          };
        }

        // add classes
        items[fontIcon.name].classes[font] = `${fontData.classPrefix}-${fontIcon.name}`;

      }
    }

    // sort icon data
    for(let key of Object.keys(items)){
      items[key]['classes'] = sortObjectKeys(items[key]['classes']);
    }

    // return items
    return sortObjectKeys(items);

  }

  /**
   * Builds and retrieves builder data composed of icon families, font styles, and icons.
   * The method fetches and organizes icon-related information into a structured format.
   *
   * @return {Promise<IBuilderData>} A promise that resolves to an object containing font data, families, styles, and icons.
   */
  static async build(): Promise<IBuilderData> {
    return Caching.wrap(CACHE_KEY, async () => {

      // create object for fonts
      const data: IBuilderData = {
        fonts: [],
        families: [],
        styles: [],
        icons: {},
      };

      // get all icons and fonts
      Logger.info(`Creating data for icons...`);
      const icons = await BuilderIcons.build();
      const fonts = await BuilderFonts.build();

      // add fonts
      data.fonts = await this.buildFonts(icons);
      Logger.info(`- Added icon fonts: ${data.fonts.join(', ')}`);

      // add families
      data.families = await this.buildFamilies(icons);
      Logger.info(`- Added icon families: ${data.families.join(', ')}`);

      // add styles
      data.styles = await this.buildStyles(icons);
      Logger.info(`- Added icon styles: ${data.styles.join(', ')}`);

      // add icons
      data.icons = await this.buildIcons(icons, fonts);
      Logger.info(`- Added icons ${Object.keys(data.icons).length} icons for ${data.fonts.length} fonts.`);

      // write files
      Logger.info(`Generating data files...`);

      // create types
      const contentTypes = `
        /**
         * Defines the permissible font options for a flat icon.
         *
         * The \`FlatIconFont\` type represents a set of predefined string literals
         * that specify the font of a flat icon.
         */
        export type FlatIconFont = ${data.fonts.map(_ => `'${_}'`).join(' | ')};
        
        /**
         * Defines the permissible weight options for a flat icon.
         *
         * The \`FlatIconFamily\` type represents a set of predefined string literals
         * that specify the weight or thickness of a flat icon. This can be used
         * to style or customize the appearance of an icon.
         */
        export type FlatIconFamily = ${data.families.map(_ => `'${_}'`).join(' | ')};
        
        /**
         * Represents the type of a flat icon.
         *
         * This type defines the visual style or category of an icon, determining
         * its overall appearance or classification.
         */
        export type FlatIconStyle = ${data.styles.map(_ => `'${_}'`).join(' | ')};
        
        /**
         * Represents a collection of flat icons where each icon is identified by a unique string key.
         * Each key corresponds to a detailed icon specification.
         *
         * This type is used to define an icon registry or catalog where multiple icons can
         * be mapped and referenced using string identifiers.
         *
         * The structure of a single icon detail is determined by the \`FlatIcon\` type.
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
      `;

      // create icons
      const contentIconsData = structuredClone(data.icons);
      const contentIcons = `
        import { FlatIcons } from './types.data';
        
        export const FLAT_ICONS: FlatIcons = ${JSON.stringify(contentIconsData, null, 2)};
      `;

      // write types to file
      writeFile(this.dataDir('/icons.interface.ts'), await prettier.format(contentTypes, { parser: 'typescript' }));
      Logger.info(`- Generated 'icons.interface.ts'.`);

      // write icons to file
      writeFile(this.dataDir('/icons.data.ts'), await prettier.format(contentIcons, { parser: 'typescript' }));
      Logger.info(`- Generated 'icons.data.ts'.`);

      // return result
      return data;

    });
  }

  /**
   * Clears the cached data associated with the specified cache key.
   *
   * @return {Promise<void>} A promise that resolves when the cache is successfully cleared.
   */
  static async clear(): Promise<void> {
    deleteDir(this.dataDir());
    await Caching.clear(CACHE_KEY);
  }

  /**
   * Combines the data directory path with the provided sub-paths.
   *
   * @param {string[]} paths One or more path segments to join with the data directory path.
   * @return {string} The resulting path string after combining the data directory with the specified sub-paths.
   */
  private static dataDir(...paths: string[]): string {
    return Vars.PATHS.DATA(...paths);
  }

}