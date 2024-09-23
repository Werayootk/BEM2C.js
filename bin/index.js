#! /usr/bin/env node

const chalk = require("chalk");
const boxen = require("boxen");
const utils = require("./utils.js");

const yargs = require("yargs");

if (yargs.argv.version == true) {
  utils.showVersion();
  return;
}

if (yargs.argv.list == true) {
  utils.showExample();
  return;
}

if (yargs.argv._[0] == null) {
  if (yargs.argv.m === "forward") {
    try {
      if (yargs.argv.i != null && yargs.argv.o != null) {
        utils.forwardEngineering(yargs.argv.i, yargs.argv.o);
      } else {
        console.log(
          "\n" +
            boxen(chalk.red("\n" + "-i and -o not null." + "\n"), {
              padding: 1,
              borderColor: "red",
              dimBorder: true,
              borderStyle: "classic",
            }) +
            "\n"
        );
        return;
      }
    } catch (error) {
      console.log(
        "\n" +
          boxen(chalk.red("\n" + "Forward Method Failure." + error + " \n"), {
            padding: 1,
            borderColor: "red",
            dimBorder: true,
            borderStyle: "classic",
          }) +
          "\n"
      );
      return;
    }
  } else if (yargs.argv.m === "reverse") {
    try {
      if (yargs.argv.i != null && yargs.argv.o != null) {
        utils.reverseEngineering(yargs.argv.i, yargs.argv.o);
      } else {
        console.log(
          "\n" +
            boxen(chalk.red("\n" + "-i and -o not null." + "\n"), {
              padding: 1,
              borderColor: "red",
              dimBorder: true,
              borderStyle: "classic",
            }) +
            "\n"
        );
        return;
      }
    } catch (error) {
      console.log(
        "\n" +
          boxen(chalk.red("\n" + "Reverse Method Failure." + error + " \n"), {
            padding: 1,
            borderColor: "red",
            dimBorder: true,
            borderStyle: "classic",
          }) +
          "\n"
      );
      return;
    }
  } else if (
    (yargs.argv.m != "reverse" || yargs.argv.m != "forward") &&
    yargs.argv.m != null
  ) {
    console.log(chalk.red('-m must be "forward" or "reverse"'));
    return;
  }
} else {
  utils.showHelp();
  return;
}
