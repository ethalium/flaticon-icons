import {Command} from 'commander';

import {default as CommandCache} from './cmd/cache';
import {default as CommandBuild} from './cmd/build';
import {deleteDir} from "./app/utils/common.utils";
import {Vars} from "./app/vars";

// create command
const command = new Command();

// init commands
CommandCache(command);
CommandBuild(command);

// start application
command.parse();

// delete temporary directory
deleteDir(Vars.PATHS.TEMP());