/*
    CSV Parser CLI
*/
const program = require('commander');
const csv = require('./csv-parser');

program.version('0.0.1');

program
    .requiredOption('-f, --file <filename.csv>', 'CSV file name to parse into new CSV (required)')
    .requiredOption('-s, --strategy <text>', 'Duplicate detection strategy -> email, phone, both (required)')
    .parse(process.argv);

const opts = program.opts();

if (opts.file != null && opts.strategy != null) {
    main();
} else {
    program.help();
}

async function main() {
    let response = await csv.parser(program.file, program.strategy)
        .catch((err) => console.log(err)); // display error message to user

    // display success message
    if (response) {
        console.log(response[0]);
    }    
}
