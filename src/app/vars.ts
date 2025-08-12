import nodePath from "path";

export class Vars {

  /**
   * An object containing methods to generate URLs for various resources
   * such as icons, stylesheets, and webfonts.
   */
  static URLS = {

    /**
     * Generates a URL string for fetching the most downloaded icon fonts from Flaticon for a specific page.
     *
     * @param {number} page - The page number to fetch the icon fonts from.
     * @returns {string} The URL string for the specified page.
     */
    ICONS: (page: number = 1): string => `https://www.flaticon.com/ajax/icon-fonts-most-downloaded/${page}`,

  };


  /**
   * An object containing utility path functions to construct various paths used in the project.
   * Each property is a function that generates a specific type of path based on input parameters.
   *
   * @property {function(...string[]): string} SVGS - Constructs a path within the 'svgs' directory under the 'assets' directory, based on provided sub-paths.
   * @property {function(...string[]): string} DATA - Constructs a path within the 'data' directory under the 'dist' directory, based on provided sub-paths.
   * @property {function(...string[]): string} ASSETS - Constructs a path within the 'assets' directory under the 'dist' directory, based on provided sub-paths.
   * @property {function(...string[]): string} OUTPUT - Constructs a path within the 'dist' directory based on provided sub-paths.
   * @property {function(...string[]): string} CWD - Constructs a path relative to the current working directory (`process.cwd()`) based on provided sub-paths.
   */
  static PATHS = {
    SVGS: (...paths: string[]) => this.PATHS.ASSETS('svgs', ...paths),
    WEBFONTS: (...paths: string[]) => this.PATHS.ASSETS('webfonts', ...paths),
    SCSS: (...paths: string[]) => this.PATHS.ASSETS('scss', ...paths),
    DATA: (...paths: string[]) => this.PATHS.OUTPUT('data', ...paths),
    ASSETS: (...paths: string[]) => this.PATHS.OUTPUT('assets', ...paths),
    OUTPUT: (...paths: string[]) => this.PATHS.CWD('dist', ...paths),
    TEMP: (...paths: string[]) => this.PATHS.CWD('.temp', ...paths),
    CACHE: (...paths: string[]) => this.PATHS.CWD('.cache', ...paths),
    CWD: (...paths: string[]) => nodePath.resolve(nodePath.join(process.cwd(), ...paths.filter(_ => !!_).map(_ => _.trim()).filter(_ => !!_))).replace(/\\/g, '/'),
  };

}