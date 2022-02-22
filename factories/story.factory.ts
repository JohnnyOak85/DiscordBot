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

  private getValue = () => (getRandom(9) * parseInt('1'.padEnd(getRandom(6), '0'))).toString();

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
      .replace(/§personals/g, this.pronouns.personals)
      .replace(/§personal/g, this.pronouns.personal)
      .replace(/§possessive/g, this.pronouns.possessive)
      .replace(/§character/g, this.character)
      .replace(/§country/g, this.decorators.countries[getRandom(this.decorators.countries.length) - 1])
      .replace(/§currency/g, this.decorators.currencies[getRandom(this.decorators.currencies.length) - 1])
      .replace(/§burn/g, this.decorators.burns[getRandom(this.decorators.burns.length) - 1])
      .replace(/§cost/g, this.getValue())
      .replace(/§child/g, this.getChild())
      .replace(/§years/g, `${getRandom(44, 3)}`)
      .replace(/§love/g, this.getLove());

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
