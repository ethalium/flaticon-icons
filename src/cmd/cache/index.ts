import {Command} from "commander";

import {default as CommandClear} from './clear.command';

export default (cmd: Command) => {

  // create command
  const command = cmd.command('cache');

  // add sub-commands
  CommandClear(command);

};