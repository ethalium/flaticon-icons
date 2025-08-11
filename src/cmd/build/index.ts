import {Command} from "commander";

import {default as CommandAll} from './_all.command';
import {default as CommandIcons} from './icons.command';
import {default as CommandSVGs} from './svgs.command';
import {default as CommandFonts} from './fonts.command';
import {default as CommandData} from './data.command';
import {default as CommandStyles} from './styles.command';

export default (cmd: Command) => {

  // create command
  const command = cmd.command('build');

  // create sub-commands
  const commands = [
    CommandAll,
    CommandIcons,
    CommandSVGs,
    CommandFonts,
    CommandData,
    CommandStyles,
  ];

  // add sub-commands
  commands.map(item => item(command));

};