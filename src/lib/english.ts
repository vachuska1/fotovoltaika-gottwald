import 'server-only';
import raw from '../../content/site.en.json';
import {siteSchema} from './schema';
import {localHref} from './locale';
export const englishSite=siteSchema.parse(raw);
for(const item of englishSite.navigation)item.href=localHref(item.href,'en');
for(const page of englishSite.pages)for(const section of page.sections)for(const item of section.items)if(item.href)item.href=localHref(item.href,'en');
