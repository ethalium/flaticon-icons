export interface IBuilderStyles {
  index: string;
  files: IBuilderStylesFile[];
}

export interface IBuilderStylesFile {
  type?: string;
  name: string;
  path: string;
}