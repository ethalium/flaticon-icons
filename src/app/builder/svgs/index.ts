import {Caching} from "../../utils/cache.utils";
import {IBuilderSVGs} from "./interfaces/svg.interface";
import {deleteDir, writeFile} from "../../utils/common.utils";
import {Vars} from "../../vars";
import {Logger} from "../../utils/logger.utils";
import {Scraper} from "../../scraper";

const CACHE_KEY = 'svgs';

export class BuilderSVGs {

  /**
   * Builds and fetches SVG objects by scraping from the FlatIcon API.
   * The method processes the icons, organizes them by font category, writes them to the filesystem, and structures them in a resulting object.
   * Utilizes a caching mechanism to optimize performance by storing the output in cache.
   *
   * @return {Promise<IBuilderSVGs>} A promise that resolves to an object containing SVG font categories with their respective SVG entries.
   */
  static async build(): Promise<IBuilderSVGs> {
    return Caching.wrap(CACHE_KEY, async () => {

      // create object for svgs
      const result: IBuilderSVGs = {};

      // create svgs for each icon
      Logger.info(`Fetching SVGs from FlatIcon API...`);
      await Scraper.fetchSVGs(data => {
        for(let svg of data.svgs){

          // create font key if not exists
          if(!Object.keys(result).includes(svg.icon.font)){
            result[svg.icon.font] = [];
          }

          // create path for svg
          const file = Vars.PATHS.SVGS(`${svg.icon.font}/${svg.icon.name}.svg`);

          // write svg to filesystem
          writeFile(file, svg.content);

          // add svg to array
          result[svg.icon.font].push({
            name: svg.icon.name,
            font: svg.icon.font,
            path: file,
          });

        }
        Logger.info(`- Processed ${data.processedSVGs} of ${data.totalSVGs} SVGs.`);
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
    deleteDir(Vars.PATHS.SVGS());
    await Caching.clear(CACHE_KEY);
  }

}