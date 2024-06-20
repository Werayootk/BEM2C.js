#! /usr/bin/env node

const chalk = require('chalk');
const boxen = require('boxen');
const utils = require('./utils.js');

const yargs = require("yargs");

console.log(yargs.argv);
if(yargs.argv.version == true){
  utils.showVersion();
  return;
}

if (yargs.argv.list == true) {
    utils.showExample();
    return;
}

if (yargs.argv._[0] == null) {
    if (yargs.argv.m === 'forward') {
        /**
         * Check -i -o
         * send path to functionForward(i, o) get result for display success or error 
         */
        try {
    
            console.log("\n" + boxen(chalk.green("\n" + "Forward Method Successfully." + "\n"), { padding: 1, borderColor: 'green', dimBorder: true, borderStyle: 'classic' }) + "\n");
            return;
        } catch (error) {
            console.log("\n" + boxen(chalk.red("\n" + "Forward Method Failure." + "\n"), { padding: 1, borderColor: 'green', dimBorder: true, borderStyle: 'classic' }) + "\n");
            return;
        }
    } else if (yargs.argv.m === 'reverse') {
        /**
         * Check -i -o
         */
        return;
    } else if ((yargs.argv.m != 'reverse' || yargs.argv.m != 'forward') && yargs.argv.m != null) {
        console.log(chalk.red('-m must be "forward" or "reverse"'));
        return;
    }
    utils.showHelp();
    return;
}

