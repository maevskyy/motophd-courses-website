import * as migration_20260725_211521_initial_schema from './20260725_211521_initial_schema';
import * as migration_20260819_202728_add_media_prefix from './20260819_202728_add_media_prefix';
import * as migration_20260819_203905 from './20260819_203905';

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
    name: '20260819_203905'
  },
];
