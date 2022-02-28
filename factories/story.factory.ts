import { getDoc, listDocs } from '../helpers/tools/database.helper';
import { getBool, getRandom } from '../helpers/tools/utils.helper';

interface Decorator {
  [name: string]: string[];
}

export class StoryFactory {
  private character = '';
  private decorators: Decorator = {};
  private personals = '';
  private personal = '';
  private possessive = '';
  private prize = '';
  private child = '';

  constructor(name: string) {
    this.character = name;
  }

  private getValue = () => (getRandom(9) * parseInt('1'.padEnd(getRandom(6), '0'), 10)).toString();
  private getDecoration = (decorator: string[]) => decorator[getRandom(decorator.length - 1)];
  private getNoun = (male: string, female: string) => (getBool() ? male : female);

  private initPronouns = () => {
    this.personals = 'they';
    this.personal = 'they';
    this.possessive = 'their';

    this.child = this.getNoun('son', 'daughter');
    this.prize = this.getNoun('guy', 'girl');
  };

  private constructBlock = (block: string[]) =>
    block[getRandom(block.length) - 1]
      .replace(/§character/g, this.character)
      .replace(/§personals/g, this.personals)
      .replace(/§personal/g, this.personal)
      .replace(/§possessive/g, this.possessive)
      .replace(/§child/g, this.child)
      .replace(/§love/g, this.prize)
      .replace(/§country/g, this.getDecoration(this.decorators.countries))
      .replace(/§currency/g, this.getDecoration(this.decorators.currencies))
      .replace(/§burn/g, this.getDecoration(this.decorators.burns))
      .replace(/§cost/g, this.getValue())
      .replace(/§years/g, `${getRandom(44, 3)}`);

  public getStory = async () => {
    let story = `${this.character}`;

    this.decorators = await getDoc<Decorator>('story', 'decorators');
    this.initPronouns();

    for (const item of await listDocs('story/blocks')) {
      const block = await getDoc<string[]>('story/blocks/', item);

      story = story + this.constructBlock(block);
    }

    return story;
  };
}
