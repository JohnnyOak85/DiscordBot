import { ensureDir, readdir, readJSON, writeJSON } from 'fs-extra';

import { DATABASE_DIR } from '../../config.json';

ensureDir(DATABASE_DIR);

export const docExists = (folder: string, doc: string) => listDocs(folder).then((dir) => dir.includes(doc));
export const getDoc = <T>(folder: string, doc: string): Promise<T> => readJSON(`${DATABASE_DIR}/${folder}/${doc}.json`);
export const listDocs = (folder: string) =>
  readdir(`${DATABASE_DIR}/${folder}`).then((dir) => dir.map((file) => file.replace('.json', '')));
export const saveDoc = <T>(doc: T, folder: string, id: string) => writeJSON(`${DATABASE_DIR}/${folder}/${id}.json`, doc);
export const updateDoc = <T>(doc: T, folder: string, id: string) =>
  getDoc(folder, id).then((d) => saveDoc(Object.assign(d, doc), folder, id));
export const findDoc = <T>(folder: string, doc: string) =>
  docExists(folder, doc).then((bool) => (bool ? getDoc<T>(folder, doc) : undefined));
