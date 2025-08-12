export interface IBuilderData {
  fonts: string[];
  families: string[];
  weights: string[];
  icons: IBuilderDataIcons;
}

export interface IBuilderDataIcons {
  [name: string]: IBuilderDataIcon;
}

export interface IBuilderDataIcon {
  name: string;
  description: string;
  classes: Record<string, string>;
  tags: string[];
}