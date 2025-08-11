import {Caching} from "../../utils/cache.utils";
import {IBuilderFontFonts, IBuilderFontFontsItem, IBuilderFonts, IBuilderFontType} from "./interfaces/font.interface";
import {createDir, deleteDir, writeFile} from "../../utils/common.utils";
import {Vars} from "../../vars";
import {Logger} from "../../utils/logger.utils";
import {BuilderSVGs} from "../svgs";
import {FontAssetType, generateFonts, OtherAssetType} from "@twbs/fantasticon";
import {RunnerResults} from "@twbs/fantasticon/lib/core/runner";
import {CodepointsMap} from "@twbs/fantasticon/lib/utils/codepoints";
import {glob, globSync} from "glob";
import {basename} from "path";
import {createDuotoneSVG} from "../../utils/svg.utils";

const CACHE_KEY = 'fonts';

export class BuilderFonts {
  private static fontTypes: FontAssetType[] = [FontAssetType.WOFF, FontAssetType.WOFF2, FontAssetType.EOT];

  /**
   * Generates a mapping of codepoints for all SVG files in the specified font directory.
   *
   * @param {string} font - The name of the font directory containing the SVG files.
   * @return {Promise<CodepointsMap>} A promise that resolves to an object mapping SVG file names (without extensions) to their corresponding codepoints.
   */
  private static async generateCodepoints(font: string): Promise<CodepointsMap> {

    // create object for codepoints
    const codepoints: CodepointsMap = {};

    // create variable for current codepoint
    let codepointCurrent: number = null;

    // create codepoint for each svg
    await glob(`${this.svgsDir(font)}/*.svg`).then(items => items.map(item => {
      const name = basename(item, '.svg');
      codepointCurrent = codepointCurrent === null ? 0xE001 : codepointCurrent + 1;
      codepoints[name] = codepointCurrent;
    }));

    // return codepoints
    return codepoints;

  }

  /**
   * Formats a map of codepoints into a record where each codepoint is represented as a hexadecimal string.
   *
   * @param type
   * @param {CodepointsMap} codepoints - A map of icon names and their corresponding codepoint values.
   * @return {Promise<Record<string, string>>} A promise resolving to a record where keys are icon names and values are codepoint strings in hexadecimal format.
   */
  private static async formatCodepoints<Type extends IBuilderFontType, Response = Type extends 'monotone' ? string : { light: string, dark: string }>(type: Type, codepoints: CodepointsMap): Promise<Record<string, Response>> {

    // create object for icons
    const icons: Record<string, any> = {};

    // create array for icon names
    const iconNames: string[] = [];
    Object.keys(codepoints).map(iconName => iconName.split('_')[0]).map(iconName => {
      if(!iconNames.includes(iconName)){
        iconNames.push(iconName);
      }
    });

    // add icons to object
    iconNames.map(iconName => {
      switch(type){
        case 'monotone': return icons[iconName] = codepoints[iconName].toString(16).padStart(4, "0");
        case 'duotone': {
          const lightIcon = `${iconName}_light`;
          const darkIcon = `${iconName}_dark`;
          if(codepoints[lightIcon] && codepoints[darkIcon]){
            icons[iconName] = {
              light: codepoints[lightIcon].toString(16).padStart(4, "0"),
              dark: codepoints[darkIcon].toString(16).padStart(4, "0"),
            };
          }
        }
      }
    });

    // return icons
    return icons;

  }

  /**
   * Generates font files for the given font name by processing SVG inputs and creating font assets.
   *
   * @param {string} font - The name of the font to generate.
   * @return {Promise<RunnerResults>} A promise that resolves with the font generation results or rejects with an error.
   */
  private static async generateMonotoneFont(font: string): Promise<RunnerResults> {
    return new Promise<RunnerResults>(async (resolve, reject) => {
      try{

        // create temporary directory
        const outputDir = createDir(this.tempDir(font));

        // create input directory
        const inputDir = this.svgsDir(font);

        // generate fonts
        const result = await generateFonts({
          name: 'icons',
          inputDir: inputDir,
          outputDir: outputDir,
          fontTypes: this.fontTypes,
          assetTypes: [OtherAssetType.HTML, OtherAssetType.CSS],
          codepoints: await this.generateCodepoints(font),
          normalize: true,
        });

        // delete temporary directory
        deleteDir(outputDir);

        // resolve font
        resolve(result);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Generates a duotone font set based on provided SVGs for the specified font.
   *
   * @param {string} font - The name of the font for which the duotone font set will be generated.
   * @return {Promise<RunnerResults>} A promise that resolves to the results of the font generation process.
   */
  private static async generateDuotoneFont(font: string): Promise<RunnerResults> {
    return new Promise<RunnerResults>(async (resolve, reject) => {
      try{

        // create temporary directory
        const outputDir = createDir(this.tempDir(font));

        // create input directory
        const svgsDir = createDir(this.svgsDir(font));

        // create duotone dir
        const duotonesDir = createDir(this.duotonesDir(font));

        // generate duotone svgs
        for(let svg of globSync(`${svgsDir}/*.svg`)){
          await createDuotoneSVG(svg, duotonesDir);
        }

        // generate fonts
        const result = await generateFonts({
          name: 'icons',
          inputDir: duotonesDir,
          outputDir: outputDir,
          fontTypes: this.fontTypes,
          assetTypes: [OtherAssetType.HTML, OtherAssetType.CSS],
          codepoints: await this.generateCodepoints(font),
          normalize: true,
        });

        // delete temporary directory
        deleteDir(outputDir);

        // resolve font
        resolve(result);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Generates a font based on the specified type and font name.
   *
   * @param {IBuilderFontType} type - The type of the font to be generated, e.g., 'duotone' or 'monotone'.
   * @param {string} font - The name of the font to generate.
   * @return {Promise<RunnerResults>} A promise that resolves to the results of the font generation process.
   */
  private static async generateFont(type: IBuilderFontType, font: string): Promise<RunnerResults> {
    return type === 'duotone' ? this.generateDuotoneFont(font) : this.generateMonotoneFont(font);
  }

  /**
   * Creates a collection of font definitions based on the provided name and result data.
   *
   * @param {string} name The base name to be used for the font files.
   * @param {RunnerResults} result The result object that contains font asset paths and other related information.
   * @return {Promise<IBuilderFontFonts>} A promise that resolves to an object containing font details.
   */
  private static async createFonts(name: string, result: RunnerResults): Promise<IBuilderFontFonts> {

    // create fileName of name
    const fileName = `uicons-${name}`;

    // create object for fonts
    const fonts: Record<string, IBuilderFontFontsItem> = {};

    // extract font assets
    const fontAssets: Array<[FontAssetType, Buffer]> = this.fontTypes
      .filter(_ => Object.keys(result.assetsOut).includes(_))
      .map(_ => [_, result.assetsOut[_] as Buffer]);

    // build font asset
    for(const [fontType, fontAsset] of fontAssets){

      // create font format
      const fontFormat = fontType === 'eot' ? 'embedded-opentype' : fontType;

      // create path for font
      const fontPath = this.fontsDir(`${fileName}.${fontType}`);

      // write font to fileSystem
      writeFile(fontPath, fontAsset);

      // add font to fonts
      fonts[fontType] = {
        name: fileName,
        type: fontType,
        format: fontFormat,
        relativePath: fontPath.replace(Vars.PATHS.ASSETS() + '/', ''),
        absolutePath: fontPath,
      };

    }

    // return fonts
    return fonts as any;

  }

  /**
   * Builds a collection of fonts based on available SVG icons and caches the results.
   *
   * This method iterates through the collection of SVG icons, generates fonts for each unique icon style,
   * and saves the generated font files to predefined paths. It ensures that fonts are not re-generated
   * if they already exist in the collection. The result is returned as an array of font definitions
   * along with their metadata and file paths.
   *
   * @return {Promise<IBuilderFonts>} A promise that resolves to an array of `BuilderFont` objects,
   * where each object contains details of a font, including its name, associated icons, and paths to its generated font files.
   */
  static async build(): Promise<IBuilderFonts> {
    return Caching.wrap(CACHE_KEY, async () => {

      // create object for fonts
      const result: IBuilderFonts = {};

      // create fonts
      Logger.info(`Building fonts for icons...`);
      const fontNames = Object.keys(await BuilderSVGs.build());
      for(let [index, fontName] of fontNames.entries()){
        index++;

        // set type of font
        const type: IBuilderFontType = fontName.startsWith('duotone') ? 'duotone' : 'monotone';

        // generate font
        const font = await this.generateFont(type, fontName);

        // create class letters for font
        const className = fontName === 'brands' ? fontName : [
          fontName.split('-')[0][0],
          fontName.split('-')[1][0]
        ].join('');

        // add font to array
        result[fontName] = {
          name: fontName,
          type: type,
          fontFamily: `uicons-${fontName}`,
          classPrefix: `fi-${className}`,
          icons: await this.formatCodepoints(type, font.codepoints),
          fonts: await this.createFonts(fontName, font),
        };

        // add font to array
        Logger.info(`(${index}/${fontNames.length}) Generated font '${fontName}'.`);

      }

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
    deleteDir(this.tempDir());
    deleteDir(this.fontsDir());
    await Caching.clear(CACHE_KEY);
  }

  /**
   * Resolves and constructs the path to the fonts directory with the specified path segments.
   *
   * @param {...string} paths - One or more path segments to be appended to the fonts directory base path.
   * @return {string} - The full path to the fonts directory with appended path segments.
   */
  private static fontsDir(...paths: string[]): string {
    return Vars.PATHS.WEBFONTS(...paths);
  }

  /**
   * Retrieves the temporary directory path for a given style family.
   *
   * @return The temporary directory path as a string for the specified style family.
   * @param name
   */
  private static tempDir(name?: string): string {
    return Vars.PATHS.TEMP('fonts', name);
  }

  /**
   * Retrieves the directory path for SVG files based on the given style family.
   *
   * @param {string} [name] - The optional style family to determine the SVG directory.
   * @return {string} The directory path for SVG files.
   */
  private static svgsDir(name?: string): string {
    return Vars.PATHS.SVGS(name);
  }

  /**
   * Generates a file path within the 'duotones' directory in the temporary paths.
   *
   * @param {string} [name] Optional file or folder name to append to the 'duotones' directory path.
   * @return {string} The constructed file path within the 'duotones' directory.
   */
  private static duotonesDir(name?: string): string {
    return Vars.PATHS.TEMP('duotones', name);
  }

}