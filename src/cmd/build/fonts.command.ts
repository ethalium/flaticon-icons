import {Command} from "commander";
import {BuilderFonts} from "../../app/builder/fonts";

export default (command: Command) => command
  .command('fonts')
  .action(async () => {
    await BuilderFonts.clear();
    await BuilderFonts.build();
  });