import { load, Root } from 'cheerio';
import { InputConfig } from '../config/types';
import getValue from './getValue';

function parse(data: string | Root, config: InputConfig): Object {
  let $;

  if (typeof data === 'string') {
    $ = load(data);
  } else if (typeof data === 'function') {
    $ = data;
  }

  return getValue({ $ }, config);
}

export default parse;
