import raw from '../../content/site.json';
import {siteSchema} from './schema';
export const site=siteSchema.parse(raw);
