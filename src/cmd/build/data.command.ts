import {Command} from "commander";
import {BuilderData} from "../../app/builder/data";

export default (command: Command) => command
  .command('data')
  .action(async () => {
    await BuilderData.clear();
    await BuilderData.build();
  });