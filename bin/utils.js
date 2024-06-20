const chalk = require('chalk');
const boxen = require('boxen');
const usage = chalk.hex('#83aaff')("\nUsage: bem2c <command>");
const packageJson = require('../package.json');
module.exports = { showHelp: showHelp, showVersion: showVersion, showExample: showExample, forwardEngineer: forwardEngineer, reverseEngineer: reverseEngineer };

function showVersion(){
    console.log(chalk.magenta.bold(`\nVersion :\t\t${packageJson.version}\n`));
}

function showHelp() {
    console.log(usage);
    console.log('\Command:\r')
    console.log('\t--version\t      ' + 'Show version number.')
    console.log('\t--list\t\t      ' + 'Show help.' + '\t\t')
    console.log('\t-m\t\t      ' + 'method transformation. (forward or reverse)' + '\t\t')
    console.log('\t-i\t\t      ' + 'path input. (forward method is path xmi but if reverse method is path source code.)' + '\t\t')
    console.log('\t-o\t\t      ' + 'path output.(forward method is path source code but if reverse method is path xmi.)' + '\t\t')
}

function showExample() {
console.log("\n" + boxen(chalk.green("\n" + "Example Forward Method" + "\n"), { padding: 1, borderColor: 'green', dimBorder: true, borderStyle: 'classic' }) + "\n");
console.log(chalk.green('bem2c -m forward -i <path_of_xmi> -o <path_of_source_code>\t  '));
console.log("\n" + boxen(chalk.red("\n" + "Example Reverse Method" + "\n"), { padding: 1, borderColor: 'red', dimBorder: true, borderStyle: 'classic' }) + "\n");
console.log(chalk.red('bem2c -m reverse -i <path_of_source_code> -o <path_of_xmi>\t  '));
}

function forwardEngineer(inputPath, outPath) {
    console.log("inputPath", inputPath);
    console.log("outPath", outPath);
}

function reverseEngineer(inputPath, outPath) {
    console.log("inputPath", inputPath);
    console.log("outPath", outPath);
}