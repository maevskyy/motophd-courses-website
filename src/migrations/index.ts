import * as migration_20260725_211521_initial_schema from './20260725_211521_initial_schema';
import * as migration_20260819_202728_add_media_prefix from './20260819_202728_add_media_prefix';
import * as migration_20260819_203905 from './20260819_203905';
import * as migration_20260831_193143 from './20260831_193143';
import * as migration_20260906_140321_purchase_locale from './20260906_140321_purchase_locale';
import * as migration_20260914_175146_add_uk_locale from './20260914_175146_add_uk_locale';
import * as migration_20260919_204644_add_lesson_cover from './20260919_204644_add_lesson_cover';

export const migrations = [
  {
    up: migration_20260725_211521_initial_schema.up,
    down: migration_20260725_211521_initial_schema.down,
    name: '20260725_211521_initial_schema',
  },
  {
    up: migration_20260819_202728_add_media_prefix.up,
    down: migration_20260819_202728_add_media_prefix.down,
    name: '20260819_202728_add_media_prefix',
  },
  {
    up: migration_20260819_203905.up,
    down: migration_20260819_203905.down,
    name: '20260819_203905',
  },
  {
    up: migration_20260831_193143.up,
    down: migration_20260831_193143.down,
    name: '20260831_193143',
  },
  {
    up: migration_20260906_140321_purchase_locale.up,
    down: migration_20260906_140321_purchase_locale.down,
    name: '20260906_140321_purchase_locale',
  },
  {
    up: migration_20260914_175146_add_uk_locale.up,
    down: migration_20260914_175146_add_uk_locale.down,
    name: '20260914_175146_add_uk_locale',
  },
  {
    up: migration_20260919_204644_add_lesson_cover.up,
    down: migration_20260919_204644_add_lesson_cover.down,
    name: '20260919_204644_add_lesson_cover'
  },
];
