import {Command} from "commander";
import {Caching} from "../../app/utils/cache.utils";
import {Logger} from "../../app/utils/logger.utils";

export default (command: Command) => command
  .command('clear')
  .action(async () => {
    Logger.info('Clearing all cache...');
    await Caching.clear();
    Logger.success('Cache cleared');
  });