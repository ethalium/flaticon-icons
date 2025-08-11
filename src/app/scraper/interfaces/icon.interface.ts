export type IScraperFetchIconsFn = (
  data: {
    icons: IScraperFetchIconsItem[],
    page: number,
    totalPages: number,
    totalIcons: number,
    processedIcons: number,
  }
) => Promise<any>|any;

export interface IScraperFetchIconsResponse {
  items: IScraperFetchIconsItem[];
  pages: number;
  total: number;
}

export interface IScraperFetchIconsItem extends Omit<IScraperFetchIconsItemRaw, 'id'>{
  font: string;
}

export interface IScraperFetchIconsItemRaw {
  author: number;
  class: string;
  description: string;
  detailUrl: URL;
  familyName: string;
  groupId: number;
  iconType: string;
  id: number;
  is_brand: boolean;
  is_editorial: boolean;
  license: number;
  name: string;
  nameDetail: string;
  packId: number;
  png: URL;
  png512: URL;
  prefix: string;
  slug: URL;
  styleFamily: string;
  styleId: number;
  styleName: string;
  svg: URL;
  tags: string;
  tagsId: string;
  team_id: number;
  type: string;
}