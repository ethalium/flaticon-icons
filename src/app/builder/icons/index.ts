import {Caching} from "../../utils/cache.utils";
import {IBuilderIcon, IBuilderIcons} from "./interfaces/icon.interface";
import {Scraper} from "../../scraper";
import {Logger} from "../../utils/logger.utils";

const CACHE_KEY = 'icons';

export class BuilderIcons {

  /**
   * Builds an array of builder icons by fetching and processing data from the FlatIcon API.
   *
   * The method retrieves raw icon data, processes it to create formatted icon objects,
   * and caches the result using a specified cache key for efficient reuse.
   *
   * @return {Promise<IBuilderIcon[]>} A promise that resolves to an array of formatted builder icons.
   */
  static async build(): Promise<IBuilderIcons> {
    return Caching.wrap(CACHE_KEY, async () => {

      // create object for icons
      const result: IBuilderIcons = {};

      // convert raw icons to items
      Logger.info(`Fetching icons from FlatIcon API...`);
      await Scraper.fetchIcons(data => {
        data.icons.map(icon => {

          // create key in result
          if(!Object.keys(result).includes(icon.font)){
            result[icon.font] = [];
          }

          // add item to array
          result[icon.font].push({
            name: icon.name,
            description: icon.description !== icon.name ? icon.description : icon.nameDetail,
            font: icon.font,
            family: icon.familyName,
            style: icon.styleName,
            tags: icon.tags.split(',').map(_ => _.trim()).filter(_ => !!_),
          })

        });
        Logger.info(`- Processed ${data.processedIcons} of ${data.totalIcons} icons.`);
      });

      // return result
      return result;

    });
  }

  /**
   * Clears the cached data associated with the specified cache key.
   *
   * @return {Promise<void>} A promise that resolves when the cache is successfully cleared.
   */
  static async clear(): Promise<void> {
    await Caching.clear(CACHE_KEY);
  }

}