import {Command} from "commander";
import {BuilderStyles} from "../../app/builder/styles";

export default (command: Command) => command
  .command('styles')
  .action(async () => {
    await BuilderStyles.clear();
    await BuilderStyles.build();
  });