const { Command } = require("commander");

const program = new Command();

program.option("--mode <mode>", "Enviroment mode", "production ").parse();

module.exports = { program };
