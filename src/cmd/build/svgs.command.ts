import {Command} from "commander";
import {BuilderSVGs} from "../../app/builder/svgs";

export default (command: Command) => command
  .command('svgs')
  .action(async () => {
    await BuilderSVGs.clear();
    await BuilderSVGs.build();
  });