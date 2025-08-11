export interface IBuilderSVGs {
  [font: string]: IBuilderSVG[];
}

export interface IBuilderSVG {
  name: string;
  font: string;
  path: string;
}