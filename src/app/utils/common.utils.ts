import * as childProcess from 'child_process';

import { existsSync, writeFileSync, readFileSync, mkdirSync, rmSync } from "fs";
import { dirname } from 'path';

export function chunkArray<T = any>(array: T[], size?: number): Array<T[]> {
  size = size || array.length;
  const chunks: any[] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function chunkNumeric<T = any>(count: number, size?: number): Array<number[]> {
  const arr = Array(count).fill(0).map((_, i) => i+1);
  return chunkArray<number>(arr, size);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createDir(path: string): string {
  if(!existsSync(path)){
    mkdirSync(path, {
      recursive: true,
    });
  }
  return path;
}

export function deleteDir(path: string): void {
  if(existsSync(path)){
    rmSync(path, {
      recursive: true,
      force: true,
    });
  }
}

export function writeFile(file: string, content: any): string {
  createDir(dirname(file));
  writeFileSync(file, content);
  return file;
}

export function readFile(file: string): Buffer|null {
  if(existsSync(file)){
    return readFileSync(file);
  }
  return null;
}

export function deleteFile(file: string): void {
  if(existsSync(file)){
    rmSync(file, {
      force: true,
    });
  }
}

export function sortObjectKeys<T extends object>(obj: T): T {
  const sorted: any = {};
  Object.keys(obj).sort().map(key => {
    sorted[key] = obj[key];
  });
  return sorted as T;
}