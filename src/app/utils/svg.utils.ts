import {createDir, readFile, writeFile} from "./common.utils";
import {basename} from "path";
import { DOMParser, XMLSerializer } from 'xmldom';
import * as xpath from 'xpath';

export async function createDuotoneSVG(inputFile: string, outputDir: string): Promise<void> {

  // create output dir
  createDir(outputDir);

  // create output files
  const inputName: string = basename(inputFile, '.svg');
  const darkFile: string = `${outputDir}/${inputName}_dark.svg`;
  const lightFile: string = `${outputDir}/${inputName}_light.svg`;

  // load svg
  const doc = new DOMParser().parseFromString(readFile(inputFile).toString('utf-8'), 'image/svg+xml');

  // define namespace for xpath
  const select = xpath.useNamespaces({ svg: 'http://www.w3.org/2000/svg' });

  // get all children
  const children: Element[] = select('/svg:svg/*', doc) as Element[];

  // create children documents
  const darkDoc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'image/svg+xml');
  const lightDoc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'image/svg+xml');

  // copy attributes from original svg to other docs
  const svgElem = select('/svg:svg', doc)[0];
  for (let i = 0; i < svgElem.attributes.length; i++) {
    const attr = svgElem.attributes[i];
    darkDoc.documentElement.setAttribute(attr.name, attr.value);
    lightDoc.documentElement.setAttribute(attr.name, attr.value);
  }

  // split elements
  children.map(elem => {
    if (isLightElement(elem)) {
      lightDoc.documentElement.appendChild(elem.cloneNode(true));
    } else {
      darkDoc.documentElement.appendChild(elem.cloneNode(true));
    }
  });

  // serialize and save xmls
  const serializer = new XMLSerializer();
  writeFile(darkFile, serializer.serializeToString(darkDoc));
  writeFile(lightFile, serializer.serializeToString(lightDoc));

}

function isLightElement(elem: Element) {
  const opacity = elem.getAttribute('opacity');
  if (opacity !== null && parseFloat(opacity) < 1) return true;

  // Alternativ auch style-Attribut prüfen (z.B. style="opacity:0.5")
  const style = elem.getAttribute('style');
  if (style) {
    const match = style.match(/opacity\s*:\s*([0-9.]+)/);
    if (match && parseFloat(match[1]) < 1) return true;
  }

  return false;
}