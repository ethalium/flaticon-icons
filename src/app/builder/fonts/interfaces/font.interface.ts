export interface IBuilderFonts {
  [font: string]: IBuilderFont;
}

export type IBuilderFontType = 'monotone'|'duotone';

export interface IBuilderFont {
  name: string;
  type: IBuilderFontType;
  fontFamily: string;
  classPrefix: string;
  fonts: IBuilderFontFonts;
  icons: Record<string, any>;
}

export interface IBuilderFontFonts {
  woff: IBuilderFontFontsItem;
  woff2: IBuilderFontFontsItem;
  eot: IBuilderFontFontsItem;
}

export interface IBuilderFontFontsItem {
  name: string;
  type: string;
  format: string;
  relativePath: string;
  absolutePath: string;
}