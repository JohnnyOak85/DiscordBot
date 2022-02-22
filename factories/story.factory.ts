import { getDoc, readDirectory } from '../helpers/storage.helper';
import { getBool, getRandom } from '../helpers/utils.helper';

interface Decorator {
  [name: string]: string[];
}

export class StoryFactory {
  private character = '';
  private decorators: Decorator = {};

  constructor(name: string) {
    this.character = name;
    this.getDecorator();
  }

  private getDecorator = async () => {
    this.decorators = await getDoc<Decorator>('story/decorators');
  };

  private getValue = () => (getRandom(9) * parseInt('1'.padEnd(getRandom(6), '0'))).toString();

  private getDecoration = (decorator: string[]) => decorator[getRandom(decorator.length - 1)];

  private getNoun = (male: string, female: string) => (getBool() ? male : female);

  private getBlock = (block: string[]) =>
    block[getRandom(block.length) - 1]
      .replace(/§character/g, this.character)
      .replace(/§personals/g, this.getNoun('him', 'her'))
      .replace(/§personal/g, this.getNoun('he', 'she'))
      .replace(/§possessive/g, this.getNoun('he', 'her'))
      .replace(/§child/g, this.getNoun('son', 'daughter'))
      .replace(/§love/g, this.getNoun('guy', 'girl'))
      .replace(/§country/g, this.getDecoration(this.decorators.countries))
      .replace(/§currency/g, this.getDecoration(this.decorators.currencies))
      .replace(/§burn/g, this.getDecoration(this.decorators.burns))
      .replace(/§cost/g, this.getValue())
      .replace(/§years/g, `${getRandom(44, 3)}`);

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
