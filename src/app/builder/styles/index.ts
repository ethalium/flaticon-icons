import {Caching} from "../../utils/cache.utils";
import {IBuilderStyles, IBuilderStylesFile} from "./interfaces/styles.interface";
import {deleteDir, deleteFile, writeFile} from "../../utils/common.utils";
import {Vars} from "../../vars";
import {BuilderFonts} from "../fonts";
import {IBuilderFont, IBuilderFonts} from "../fonts/interfaces/font.interface";
import {createScssObjects} from "../../utils/scss.utils";
import {Logger} from "../../utils/logger.utils";
import {basename} from "path";
import * as sass from 'sass';
import * as prettier from 'prettier';

const CACHE_KEY = 'styles';

export class BuilderStyles {

  /**
   * Builds a SCSS variables file with font icon mappings.
   *
   * @param {IBuilderFonts} fonts - An object containing font data, where each font includes its respective icons and codes.
   * @return {Promise<IBuilderStylesFile>} A promise that resolves to the details of the created SCSS file, including its type, name, and path.
   */
  private static async buildVariables(fonts: IBuilderFonts): Promise<IBuilderStylesFile[]> {

    // create item
    const item: IBuilderStylesFile = {
      type: 'VARIABLES',
      name: '_variables.scss',
      path: this.scssDir('_variables.scss'),
    };

    // create object for icon variables
    const monotoneIcons: any = {};
    const duotoneIcons: any = {};

    // add icons to variables
    Object.entries(fonts).map(([fontName, fontData]) => {
      switch(fontData.type){
        case 'monotone': {
          Object.entries(fontData.icons).map(([iconName, iconCode]) => {
            if(!monotoneIcons[iconName]){
              monotoneIcons[iconName] = {};
            }
            monotoneIcons[iconName][fontName] = `"\\${iconCode}"`;
          });
          break;
        }
        case 'duotone': {
          Object.entries(fontData.icons).map(([iconName, iconCodes]) => {
            if(!duotoneIcons[iconName]){
              duotoneIcons[iconName] = {};
            }
            duotoneIcons[iconName][fontName] = {
              light: `"\\${iconCodes['light']}"`,
              dark: `"\\${iconCodes['dark']}"`,
            };
          });
          break;
        }
      }
    });

    // create file content
    const fileContent = createScssObjects([
      {
        name: 'FI-SELECTORS',
        comment: ['All available icon selectors.'],
        content: ['".fi"'],
      },
      {
        name: 'FI-MONOTONE-ICONS',
        comment: ['All available monotone icons with their font codes.'],
        content: monotoneIcons,
      },
      {
        name: 'FI-DUOTONE-ICONS',
        comment: ['All available duotone icons with their font codes.'],
        content: duotoneIcons,
      }
    ]);

    // write to fileSystem
    writeFile(item.path, fileContent);

    // return item
    return [item];

  }

  /**
   * Builds icon styles by generating an SCSS file containing the @font-face declarations for the provided font.
   *
   * @param {string} name - The name of the icon font. It will be used as the filename for the generated styles file.
   * @param {IBuilderFont} font - The font object containing font-family details and fonts with their formats and relative paths.
   * @return {Promise<IBuilderStylesFile>} A promise that resolves to an object containing details of the generated styles file.
   */
  private static async buildIcons(name: string, font: IBuilderFont): Promise<IBuilderStylesFile[]> {

    // create item
    const item: IBuilderStylesFile = {
      type: 'ICONS',
      name: `${name}.scss`,
      path: this.scssDir(`${name}.scss`),
    };

    // create file content
    const fileContent: string[] = [];

    // add base content
    fileContent.push(`
      @use "sass:map";
      @use "sass:string";
      @use "./variables" as vars;
    
      @font-face {
        font-display: block;
        font-family: ${font.fontFamily};
        src: ${Object.values(font.fonts).map(type => `url("../${type.relativePath}") format("${type.format}")`).join(', ')};
      }
      
      @each $selector in vars.$FI-SELECTORS {
        #{$selector} {
          position: relative;
          display: inline-block;
          width: 1em;
          height: 1em;
        }
      }
    `);

    // add content based on font type
    switch(font.type){

      // monotone
      case 'monotone': {
        fileContent.push(`
          @each $selector in vars.$FI-SELECTORS {
            #{$selector}[class^="${font.classPrefix}-"]::before,
            #{$selector}[class*="${font.classPrefix}-"]::before
            {
              display: inherit;
              font-family: ${font.fontFamily}, serif !important;
              font-style: normal;
              font-weight: normal !important;
              font-variant: normal;
              text-transform: none;
              line-height: 1;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          }
        
          @each $iconName, $iconFonts in vars.$FI-MONOTONE-ICONS {
            @if map.has-key($iconFonts, "${font.name}") {
              .${font.classPrefix}-#{$iconName}::before {
                content: "#{map.get($iconFonts, "${font.name}")}";
              }
            }
          }
        `);
        break;
      }

      // duotone
      case 'duotone': {
        fileContent.push(`
          @each $selector in vars.$FI-SELECTORS {
            #{$selector}[class^="${font.classPrefix}-"]::before,
            #{$selector}[class*="${font.classPrefix}-"]::before,
            #{$selector}[class^="${font.classPrefix}-"]::after,
            #{$selector}[class*="${font.classPrefix}-"]::after
            {
              position: absolute;
              display: inherit;
              font-family: ${font.fontFamily}, serif !important;
              font-style: normal;
              font-weight: normal !important;
              font-variant: normal;
              text-transform: none;
              line-height: 1;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          }
          
          @each $iconName, $iconFonts in vars.$FI-DUOTONE-ICONS {
            @if map.has-key($iconFonts, "${font.name}") {
              .${font.classPrefix}-#{$iconName}::before {
                color: var(--fi-primary-color, inherit);
                opacity: var(--fi-primary-opacity, 1);
                content: "#{map.get(map.get($iconFonts, '${font.name}'), 'dark')}";
              }
              .${font.classPrefix}-#{$iconName}::after {
                color: var(--fi-secondary-color, inherit);
                opacity: var(--fi-secondary-opacity, .5);
                content: "#{map.get(map.get($iconFonts, '${font.name}'), 'light')}";
              }
            }
          }
        `);
        break;
      }

    }

    // write content to fileSystem
    writeFile(item.path, await prettier.format(fileContent.join('\n'), {
      parser: 'scss',
    }));

    // return item
    return [item];

  }

  /**
   * Builds an index file for the provided styles and returns an array of builder style files.
   *
   * @param {IBuilderStyles} styles - An object containing data about the styles, including the index path
   * and a reference to associated files to be processed.
   * @return {Promise<IBuilderStylesFile[]>} - A promise that resolves to an array containing the generated
   * builder style file(s).
   */
  private static async buildIndex(styles: IBuilderStyles): Promise<IBuilderStylesFile[]> {

    // create item
    const item: IBuilderStylesFile = {
      name: basename(styles.index),
      path: styles.index,
    };

    // create array for content
    const content: string[] = [];

    // add variables
    Object
      .values(styles.files)
      .filter(file => file.type === 'VARIABLES')
      .map(file => content.push(`@forward "scss/${file.name}";`));

    // add styles
    Object
      .values(styles.files)
      .filter(file => file.type === 'ICONS')
      .map(file => content.push(`@forward "scss/${file.name}";`));

    // create file
    writeFile(item.path, content.join('\n'));

    // return item
    return [item];

  }

  /**
   * Builds CSS files based on the source index file and outputs both expanded and minified versions.
   * The method compiles the CSS using a SASS compiler, writes the results to the specified paths,
   * and returns metadata about the generated files.
   *
   * @return {Promise<IBuilderStylesFile[]>} A promise that resolves to an array containing the metadata
   * of the generated CSS files, including their type, format, names, and paths.
   */
  private static async buildCSS(): Promise<IBuilderStylesFile[]> {

    // create base item
    const item: IBuilderStylesFile = {
      name: basename(this.cssFile()),
      path: this.cssFile(),
    };

    // create minified item
    const itemMinified: IBuilderStylesFile = {
      name: basename(this.cssMinifiedFile()),
      path: this.cssMinifiedFile(),
    };

    // compile index file
    const indexContent = await sass.compileAsync(this.indexFile(), { style: 'expanded', sourceMap: false })
      .then(result => result.css.replace(/\.\.\/webfonts/g, 'webfonts'));

    // save compiled index file on fileSystem
    writeFile(item.path, indexContent);

    // save minified index file on fileSystem
    writeFile(itemMinified.path, indexContent
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/[\r\n\t]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim()
    );

    // return items
    return [item, itemMinified];

  }

  /**
   * Builds an HTML file with the specified fonts and returns an array of style file metadata.
   *
   * @param {IBuilderFont} fonts - The fonts metadata required for building the HTML file.
   * @return {Promise<IBuilderStylesFile[]>} A promise that resolves to an array of objects containing style file details.
   */
  private static async buildHtml(fonts: IBuilderFonts): Promise<IBuilderStylesFile[]> {

    // create base item
    const item: IBuilderStylesFile = {
      name: basename(this.htmlFile()),
      path: this.htmlFile(),
    };

    // create sections
    const sections: string[] = Object.values(fonts).map((font) => {

      // create icon elements
      const icons = Object.keys(font.icons).map(icon => `
        <div class="preview">
          <span class="inner">
            <span class="fi ${font.classPrefix}-${icon}"></span>
          </span>
          <br>
          <span class="label">${icon}</span>
        </div>
      `);

      // return section
      return `
        <h1>${font.name}</h1>
        ${icons.join(' ')}
      `;

    });

    // write html file
    writeFile(item.path, await prettier.format(`
      <html>
        <head>
          <link rel="stylesheet" href="./assets/flat-icons.min.css"/>
          <style>
            body {
              font-family: sans-serif;
              margin: 0;
              padding: 30px 20px;
              text-align: center;
            }
            .preview {
              width: 100px;
              display: inline-block;
              margin: 10px;
            }
            .preview .inner {
              display: inline-block;
              width: 100%;
              text-align: center;
              background: #f5f5f5;
              -webkit-border-radius: 3px 3px 0 0;
              -moz-border-radius: 3px 3px 0 0;
              border-radius: 3px 3px 0 0;
            }
            .preview .inner  {
              padding: calc((85px - 40px) / 2) 0;
              font-size: 40px;
              color: #333;
            }
            .label {
              display: inline-block;
              width: 100%;
              box-sizing: border-box;
              padding: 5px;
              font-size: 10px;
              font-family: Monaco, monospace;
              color: #666;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              background: #ddd;
              -webkit-border-radius: 0 0 3px 3px;
              -moz-border-radius: 0 0 3px 3px;
              border-radius: 0 0 3px 3px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${sections.join('')}
        </body>
      </html>
    `, { parser: 'html' }));

    // return file
    return [item];

  }

  /**
   * Asynchronously builds and returns the styles object by wrapping the operation with a caching mechanism.
   *
   * @return {Promise<IBuilderStyles>} A promise that resolves to the constructed styles object, containing an index file and associated files.
   */
  static async build(): Promise<IBuilderStyles> {
    return Caching.wrap(CACHE_KEY, async () => {

      // create object for styles
      const styles: IBuilderStyles = {
        index: this.indexFile(),
        files: []
      };

      // get fonts
      Logger.info(`Creating styles...`);
      const fonts = await BuilderFonts.build();

      // build variables
      Logger.info(`Generating variables file...`);
      await this.buildVariables(fonts).then(items => items.map(item => {
        styles.files.push(item);
      }));

      // build icons
      Logger.info(`Generating icon files...`);
      for(const [fontName, fontData] of Object.entries(fonts)){
        await this.buildIcons(fontName, fontData).then(items => items.map(item => {
          styles.files.push(item);
          Logger.info(`- Generated '${item.name}'.`);
        }));
      }

      // build index
      Logger.info(`Generating index file...`);
      await this.buildIndex(styles).then(items => items.map(item => {
        styles.files.push(item);
      }));

      // build css
      Logger.info(`Generating CSS files...`);
      await this.buildCSS().then(items => items.map(item => {
        styles.files.push(item);
        Logger.info(`- Generated '${item.name}'.`);
      }));

      // build html
      Logger.info(`Generating HTML files...`);
      await this.buildHtml(fonts).then(items => items.map(item => {
        styles.files.push(item);
        Logger.info(`- Generated '${item.name}'.`);
      }));

      // return styles
      return styles;

    });
  }

  /**
   * Clears the cached data associated with the specified cache key.
   *
   * @return {Promise<void>} A promise that resolves when the cache is successfully cleared.
   */
  static async clear(): Promise<void> {
    deleteFile(this.indexFile());
    deleteFile(this.cssFile());
    deleteFile(this.cssMinifiedFile());
    deleteDir(this.scssDir());
    await Caching.clear(CACHE_KEY);
  }

  /**
   * Retrieves the path of the flat-icons.scss file from the assets directory.
   *
   * @return {string} The file path of the flat-icons.scss file.
   */
  private static indexFile(): string {
    return Vars.PATHS.ASSETS('flat-icons.scss');
  }

  /**
   * Retrieves the path to the CSS file for flat-icons.
   *
   * @return {string} The path to the 'flat-icons.css' file.
   */
  private static cssFile(): string {
    return Vars.PATHS.ASSETS('flat-icons.css');
  }

  /**
   * Generates a string representing the path to the minified CSS file for flat-icons.
   *
   * @return {string} The path to the 'flat-icons.min.css' file located in the assets directory.
   */
  private static cssMinifiedFile(): string {
    return Vars.PATHS.ASSETS('flat-icons.min.css');
  }

  /**
   * Retrieves the file path for the HTML file containing flat icons.
   *
   * @return {string} The file path to the flat-icons.html located in the assets directory.
   */
  private static htmlFile(): string {
    return Vars.PATHS.ASSETS('flat-icons.html');
  }

  /**
   * Combines the data directory path with the provided sub-paths.
   *
   * @param {string[]} paths One or more path segments to join with the data directory path.
   * @return {string} The resulting path string after combining the data directory with the specified sub-paths.
   */
  private static scssDir(...paths: string[]): string {
    return Vars.PATHS.SCSS(...paths);
  }

}