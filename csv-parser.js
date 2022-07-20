const fs = require('fs');
const readline = require('readline');
const strategy = require('./duplicate-strategy-type');

/**
 * CSV parser, not using third-party package (csv-parse, fast-csv, neat-csv) 
 * since we can use nodejs built in modules to read and write to a file
 * 
 * @param {*} filename 
 * @param {*} inputStrategy 
 * 
 */
async function parser(filename, inputStrategy) {
    return new Promise(async (resolve, reject) => {
        if (!isValidStrategy(inputStrategy)) {
            reject('Incorrect duplicate strategy type. Please enter one of the following: email, phone, both');
            return;
        }

        const basePath = './csv-files/';
        const outputPath = './output-csv/';
        const filepath = basePath + filename; 

        if (!(await isExists(filepath))) {
            reject('File was not found');            
            return;
        }        

        try {
            const stream = fs.createReadStream(filepath);

            // should check for errors on stream
            stream.on('error', _ => {
                throw 'There was an error reading from stream of csv.';
            });;

            const reader = readline.createInterface({
                input: stream,
                crlfDelay: Infinity, // /r and /n together will always be considered a new line when set to Infinity
            });

            let rowCount = 0;
            let csvContentArr = [];    
            let headerRow = [];
            let strategyTrackerObj = {};
            let emailIndex = -1;
            let phoneIndex = -1;
            
            // listen for line event
            reader.on('line', (line) => {
                let rowLine = line.split('\n');

                if (rowCount === 0) {
                    // keeping track of the header row to re-add it to output csv
                    headerRow.push(rowLine[0].split(','));
                } else {                          
                    for (let item of rowLine) {
                        let cols = item.split(',');

                        // find the indexes of email and/or phone
                        if (rowCount === 1) {
                            [emailIndex, phoneIndex] = getEmailPhoneIndex(cols, inputStrategy);
                        }

                        filterDuplicates(strategyTrackerObj, emailIndex, phoneIndex, cols, csvContentArr);               
                    }
                }
    
                rowCount++;
            });
    
            reader.on('close', () => {
                // write our csv after removing all duplicates
                const csvContent = writeCsvFile(outputPath + 'output.csv', csvContentArr, headerRow);
    
                // resolve promise passing an array with a success message at index 0 and the csv content at index 1
                resolve(['Successfully parsed CSV. Check the /output-cs directory for file.', csvContent]);
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * filter out duplicates helper function
 * 
 * strategyTrackerObj keeps track of duplicates in a HashTable {}, where values are the count
 * and have a constant time O(1) lookup for when searching for duplicates
 */
function filterDuplicates(strategyTrackerObj, emailIndex, phoneIndex, rowLine, csvContentArr) {
    let email = emailIndex > -1 ? rowLine[emailIndex].toLowerCase() : undefined;
    if (email && !isEmpty(email)) {
            strategyTrackerObj[email] = (strategyTrackerObj[email] || 0) + 1;
    }    

    let phone = phoneIndex > -1 ? rowLine[phoneIndex].replace(/\D/g, '') : undefined;
    if (phoneIndex > -1 && !isEmpty(phone)) {
        strategyTrackerObj[phone] = (strategyTrackerObj[phone] || 0) + 1;
    }

    // add row into array only if there is no duplicate - empty cells ok
    if ((!email || isEmpty(email) || strategyTrackerObj[email] < 2) 
        && (!phone || isEmpty(phone) || strategyTrackerObj[phone] < 2)) {            
            csvContentArr.push(rowLine);
    }
}

/**
 * helper function to write out to csv file
 */
function writeCsvFile(outputFile, csvContentArr, headerRow) {
    const writer = fs.createWriteStream(outputFile);
    const csvContent = csvContentArr.map((c) => c.join(','));
    const outCsvArr = [...headerRow, ...csvContent];

    writer.write(outCsvArr.join('\r\n'));

    return csvContent;
}

/**
 * retrieve the email and phone indexes from csv columns
 */
function getEmailPhoneIndex(cols, inputStrategy) {
    let emailIndex = -1;
    let phoneIndex = -1;

    for (let c of cols) {
        if (emailIndex === -1 && ([strategy.STRATEGY_TYPE.EMAIL, strategy.STRATEGY_TYPE.EMAIL_PHONE].includes(inputStrategy))) {
            let isEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(c);
            if (isEmail) {
                emailIndex = cols.indexOf(c);
            }
        } 
        
        if (phoneIndex === -1 && ([strategy.STRATEGY_TYPE.PHONE, strategy.STRATEGY_TYPE.EMAIL_PHONE].includes(inputStrategy))) {
            let isPhone = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(c);
            if (isPhone) {
                phoneIndex = cols.indexOf(c);
            }
        }
    }

    return [emailIndex, phoneIndex];
}

/**
 * helper function to check if string is null or contains whitespace
 */
function isEmpty(str) {
    return (!str || /^\s*$/.test(str));
}

/**
 * checks if strategy for duplicates is valid
 * @param {*} inputStrategy 
 * @returns boolean
 */
function isValidStrategy(inputStrategy) {
    return (inputStrategy === strategy.STRATEGY_TYPE.EMAIL
            || inputStrategy === strategy.STRATEGY_TYPE.PHONE
            || inputStrategy === strategy.STRATEGY_TYPE.EMAIL_PHONE);
}

/**
 * check if a file exists in the directory
 * @param {*} filePath 
 * @returns boolean
 */
async function isExists(filePath) {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch { 
        return false;
    }
}

module.exports = { parser }
