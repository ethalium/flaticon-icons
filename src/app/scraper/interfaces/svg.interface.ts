import {IScraperFetchIconsItem} from "./icon.interface";

export type IScraperFetchSVGsFn = (
  data: {
    svgs: IScraperFetchSVGsItem[],
    page: number,
    totalPages: number,
    totalSVGs: number,
    processedSVGs: number,
  }
) => Promise<any>|any;

export interface IScraperFetchSVGsItem {
  icon: IScraperFetchIconsItem;
  content: string;
}