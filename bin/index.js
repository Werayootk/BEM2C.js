#! /usr/bin/env node

const chalk = require('chalk');
const boxen = require('boxen');
const utils = require('./utils.js');

const yargs = require("yargs");

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
        try {
            if (yargs.argv.i != null && yargs.argv.o != null) {
                utils.forwardEngineer(yargs.argv.i, yargs.argv.o);
            } else {
                console.log("\n" + boxen(chalk.red("\n" + "-i and -o not null." + "\n"), { padding: 1, borderColor: 'red', dimBorder: true, borderStyle: 'classic' }) + "\n");
                return;
            }
            console.log("\n" + boxen(chalk.green("\n" + "Forward Method Successfully." + "\n"), { padding: 1, borderColor: 'green', dimBorder: true, borderStyle: 'classic' }) + "\n");
            return;
        } catch (error) {
            console.log("\n" + boxen(chalk.red("\n" + "Forward Method Failure." + "\n"), { padding: 1, borderColor: 'red', dimBorder: true, borderStyle: 'classic' }) + "\n");
            return;
        }
    } else if (yargs.argv.m === 'reverse') {
        try {
            if (yargs.argv.i != null && yargs.argv.o != null) {
                utils.reverseEngineer(yargs.argv.i, yargs.argv.o);
            } else {
                console.log("\n" + boxen(chalk.red("\n" + "-i and -o not null." + "\n"), { padding: 1, borderColor: 'red', dimBorder: true, borderStyle: 'classic' }) + "\n");
                return;
            }
            console.log("\n" + boxen(chalk.green("\n" + "Forward Method Successfully." + "\n"), { padding: 1, borderColor: 'green', dimBorder: true, borderStyle: 'classic' }) + "\n");
            return;
        } catch (error) {
            console.log("\n" + boxen(chalk.red("\n" + "Forward Method Failure." + "\n"), { padding: 1, borderColor: 'red', dimBorder: true, borderStyle: 'classic' }) + "\n");
            return;
        }
    } else if ((yargs.argv.m != 'reverse' || yargs.argv.m != 'forward') && yargs.argv.m != null) {
        console.log(chalk.red('-m must be "forward" or "reverse"'));
        return;
    }
    utils.showHelp();
    return;
} else {
    utils.showHelp();
    return;
}

// /Users/werayootk/Downloads/project_code/thesis/BEM2C.js/data/forward/output/
// /Users/werayootk/Downloads/project_code/thesis/BEM2C.js/data/forward/input/CarRentalSystemDiagram.xmi