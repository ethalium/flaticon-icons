import {Command} from "commander";
import {BuilderIcons} from "../../app/builder/icons";

export default (command: Command) => command
  .command('icons')
  .action(async () => {
    await BuilderIcons.clear();
    await BuilderIcons.build();
  });