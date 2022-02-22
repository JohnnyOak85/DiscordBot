import { getDoc, readDirectory } from '../helpers/storage.helper';
import { getBool, getRandom } from '../helpers/utils.helper';

interface Pronouns {
  personal: string;
  personals: string;
  possessive: string;
}

interface Decorator {
  [name: string]: string[];
}

export class StoryFactory {
  private character = '';
  private pronouns: Pronouns;
  private decorators: Decorator = {};

  constructor(name: string) {
    this.character = name;
    this.pronouns = this.getPronouns();
    this.getDecorator();
  }

  private getDecorator = async () => {
    this.decorators = await getDoc<Decorator>('story/decorators');
  };

  private getChild = () => (getBool() ? 'son' : 'daughter');

  private getLove = () => (getBool() ? 'guy' : 'girl');

  private getPronouns = () =>
    getBool()
      ? {
          personal: 'he',
          personals: 'him',
          possessive: 'his'
        }
      : {
          personal: 'she',
          personals: 'her',
          possessive: 'her'
        };

  private getBlock = (block: string[]) =>
    block[getRandom(block.length) - 1]
      .replace('§personals', this.pronouns.personals)
      .replace('§personal', this.pronouns.personal)
      .replace('§possessive', this.pronouns.possessive)
      .replace('§character', this.character)
      .replace('§country', this.decorators.countries[getRandom(this.decorators.countries.length) - 1])
      .replace('§burns', this.decorators.burns[getRandom(this.decorators.burns.length) - 1])
      .replace('§costs', this.decorators.costs[getRandom(this.decorators.costs.length) - 1])
      .replace('§child', this.getChild())
      .replace('§years', `${getRandom(44, 3)}`)
      .replace('§love', this.getLove());

  public getStory = async () => {
    const list = await readDirectory('story/blocks');
    let story = `${this.character}`;

    for (const item of list) {
      const block = await getDoc<string[]>(`story/blocks/${item}`);

      story = story + this.getBlock(block);
    }

    return story;
  };
}
