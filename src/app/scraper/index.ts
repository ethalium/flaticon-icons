import {Http} from "../utils/http.utils";
import {Vars} from "../vars";
import {chunkArray, chunkNumeric, sleep} from "../utils/common.utils";
import {IScraperFetchIconsFn, IScraperFetchIconsItem, IScraperFetchIconsResponse} from "./interfaces/icon.interface";
import {IScraperFetchSVGsFn, IScraperFetchSVGsItem} from "./interfaces/svg.interface";
import {Agent} from "https";

export class Scraper {

  /**
   * Sanitizes the provided name by normalizing and formatting it to ensure it meets
   * specific criteria. This includes removing diacritical marks, replacing specific
   * characters, and ensuring the result is in lowercase.
   *
   * @param {string} name - The input name to be sanitized.
   * @return {string} The sanitized version of the input name.
   */
  private static sanitizeName(name: string): string {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
      .toLowerCase();
  }

  /**
   * Fetches icons from the given API, processes them, and optionally calls a callback function with the results.
   *
   * @param {IScraperFetchIconsFn} [onIcons] - Optional callback function to execute on each batch of fetched icons, passing information about the current page, total pages, icons fetched so far, and total icons.
   * @return {Promise<IScraperFetchIconsItem[]>} - A promise that resolves to an array of FlatIconRaw objects representing the icons fetched from the API.
   */
  static async fetchIcons(onIcons: IScraperFetchIconsFn): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try{

        // create number for processed items
        let processedItems: number = 0;

        // fetch pages from api
        const pages = await Http.getJson<IScraperFetchIconsResponse>(Vars.URLS.ICONS()).then(_ => _.pages);

        // fetch items
        for(let pageChunk of chunkNumeric(pages, 10)){
          await Promise.all(pageChunk.map(async page => {

            // fetch items from api
            const {items, total} = await Http.getJson<IScraperFetchIconsResponse>(Vars.URLS.ICONS(page));

            // format items
            items.map(item => {
              item.description = item.name === item.description ? this.sanitizeName(item.description) : item.description;
              item.name = this.sanitizeName(item.name);
              item.font = item.familyName === 'brands' ? 'brands' : item.styleFamily.replace('/', '-');
            });

            // increase processed items
            processedItems += items.length;

            // run onIcons function
            if(typeof onIcons === 'function'){
              await onIcons({
                icons: items,
                page: page,
                totalPages: pages,
                totalIcons: total,
                processedIcons: processedItems,
              });
            }

          }));
          await sleep(1000);
        }

        // done
        resolve();

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Fetches SVGs by downloading them based on the available icons data from an API.
   *
   * @param {IScraperFetchSVGsFn} [onSVGs] - Optional callback function that is executed
   *                                          during the process of fetching SVGs. The function
   *                                          receives data including processed SVGs, current page,
   *                                          total pages, and total number of icons.
   * @return {Promise<IScraperFetchSVGsItem[]>} - A promise that resolves to an array of objects,
   *                                              each containing the icon information and its corresponding SVG content.
   */
  static async fetchSVGs(onSVGs: IScraperFetchSVGsFn): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try{

        // create number for processed items
        let processedItems: number = 0;

        // fetch icons from api
        await this.fetchIcons(async (data) => {

          // create array for svgs
          const svgs: IScraperFetchSVGsItem[] = [];

          // download svgs
          for(let chunk of chunkArray(data.icons, 20)){

            // create keepAlive agent
            const agent = new Agent({
              keepAlive: true,
            });

            // fetch all svgs
            await Promise.all(chunk.map(async item => {
              svgs.push({
                icon: item,
                content: await Http.getText(item.svg, agent)
              });
            }));

            // destroy agent
            agent.destroy();

          }

          // increase processed items
          processedItems += svgs.length;

          // run onSVGs function
          if(typeof onSVGs === 'function'){
            await onSVGs({
              svgs: svgs,
              page: data.page,
              totalPages: data.totalPages,
              totalSVGs: data.totalIcons,
              processedSVGs: processedItems,
            });
          }

        });

        // done
        resolve();

      }catch(e){
        reject(e);
      }
    });
  }

}