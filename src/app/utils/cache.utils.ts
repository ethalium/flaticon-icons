import {existsSync, rmSync} from 'fs';
import {readFile, writeFile} from "./common.utils";
import {Vars} from "../vars";

export class Caching {
  private static cacheData: Record<string, any> = {};

  /**
   * Caches the result of an operation in memory and optionally on the file system.
   * If the result for the specified key already exists in memory or the file system,
   * it retrieves the cached value instead of executing the function again.
   *
   * @param {string} key - A unique identifier for the cached operation.
   * @param {() => T|Promise<T>} fn - A function that generates the value to be cached.
   * @return {Promise<T>} A promise that resolves to the cached or newly generated value.
   */
  static wrap<T = any>(key: string, fn: () => T|Promise<T>): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      try{

        // return memory cached value if exists
        if(Object.keys(this.cacheData).includes(key)){
          return resolve(this.cacheData[key]);
        }

        // create file for key
        const file = this.cacheFile(key);

        // return cached value if file exists
        if(existsSync(file)){
          return resolve(JSON.parse(readFile(file).toString('utf-8')).data);
        }

        // get data
        const data = await fn();

        // create file on fileSystem and store date in memory cache
        writeFile(file, JSON.stringify({data}, null, 2));
        this.cacheData[key] = data;

        // return data
        resolve(data);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Clears the cached data. If a key is provided, only the data associated with the key will be cleared.
   * If no key is provided, all cached data will be cleared.
   *
   * @param {string} [key] - The optional key for the specific cached data to clear.
   * @return {Promise<void>} A promise that resolves when the cache has been successfully cleared.
   */
  static clear(key?: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try{

        // clear everything if key is not set
        if(!key){
          this.cacheData = {};
          if(!existsSync(this.cachePath())){
            rmSync(this.cachePath(), {
              recursive: true,
              force: true
            });
          }
          return resolve();
        }

        // delete local cache if exists
        if(key in this.cacheData){
          delete this.cacheData[key];
        }

        // create file for key
        const file = this.cacheFile(key);

        // delete cache file if exists
        if(existsSync(file)){
          rmSync(file, {
            force: true
          });
        }

        // done
        return resolve();

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Caches a file with the specified key by appending `.json` to the key and generating a cache path.
   *
   * @param {string} key - The unique identifier for the file to be cached.
   * @return {string} The full path to the cached file.
   */
  static cacheFile(key: string): string {
    return this.cachePath(`${key}.json`);
  }

  /**
   * Generates a cache path by appending the provided path segments to a base cache directory.
   *
   * @param {...string} paths - The path segments to append to the cache directory.
   * @return {string} The constructed cache path as a string.
   */
  static cachePath(...paths: string[]): string {
    return Vars.PATHS.CACHE(...paths);
  }

}