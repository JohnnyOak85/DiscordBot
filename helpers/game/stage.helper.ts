import { Collection } from 'discord.js';

const stages = new Collection<string, NodeJS.Timeout>();

export const addStage = (name: string, timer: NodeJS.Timeout) => stages.set(name, timer);

export const getStage = (name: string) => stages.get(name);

export const findStage = (name: string) => stages.has(name);

export const deleteStage = (name: string) => {
  const stage = getStage(name);
  if (stage) clearTimeout(stage);
  stages.delete(name);
};
