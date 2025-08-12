export interface IBuilderIcons {
  [font: string]: IBuilderIcon[];
}

export interface IBuilderIcon {
  name: string;
  description: string;
  font: string;
  family: string;
  weight: string;
  tags: string[];
}