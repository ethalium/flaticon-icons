import {Command} from "commander";
import {BuilderIcons} from "../../app/builder/icons";
import {BuilderSVGs} from "../../app/builder/svgs";
import {BuilderFonts} from "../../app/builder/fonts";
import {BuilderData} from "../../app/builder/data";
import {BuilderStyles} from "../../app/builder/styles";

export default (command: Command) => command
  .command('all')
  .action(async () => {

    // create array for builder
    const builders = [
      BuilderIcons,
      BuilderSVGs,
      BuilderFonts,
      BuilderData,
      BuilderStyles,
    ];

    // execute builders
    for(let builder of builders){
      await builder.clear();
      await builder.build();
    }

  });