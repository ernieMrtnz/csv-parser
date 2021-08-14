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
        const basePath = './csv-files/';
        const outputPath = './output-csv/';
        const filepath = basePath + filename; 

        let rowCount = 0;
        let csvContentArr = [];    
        let headerRow = [];
        let strategyTrackerObj = {};        

        try {
            if (!(await isExists(filepath))) {
                reject('File was not found');            
                return;
            }

            const stream = fs.createReadStream(filepath);

            // should check for errors on stream and reject promise
            stream.on('error', _ => {
                throw 'There was an error reading from stream of csv.';
            });;

            const reader = readline.createInterface({
                input: stream,
                crlfDelay: Infinity,
            }); 
            const emailIndx = 2;
            const phoneIndx = 3; 
            
            reader.on('line', (line) => {
                let rowLine = line.split('\n');
    
                if (rowCount === 0) {
                    // keeping track of the header row to re-add it to output csv
                    headerRow.push(rowLine[0].split(','));
                } else {                          
                    for (let item of rowLine) {
                        let itemRowLine = item.split(',');
    
                        if (inputStrategy === strategy.STRATEGY_TYPE.EMAIL_PHONE) {
                            // pass both email and phone index to filter                    
                            filterDuplicates(strategyTrackerObj, emailIndx, phoneIndx, itemRowLine, csvContentArr);
                        } else {
                            const index = inputStrategy === strategy.STRATEGY_TYPE.EMAIL 
                                ? emailIndx 
                                : phoneIndx;
                            // filter by email only or by phone only, not both
                            filterDuplicates(strategyTrackerObj, index, undefined, itemRowLine, csvContentArr);
                        }                
                    }
                }
    
                rowCount++;
            });
    
            reader.on('close', () => {
                // write our csv after removing all duplicates
                const csvContent = writeCsvFile(outputPath + 'output.csv', csvContentArr, headerRow);
    
                // resolve promise passing an array with a success message at index 0 and the csv content at index 2
                resolve(['Successfully parsed CSV. Check the /output-cs directory for file.', csvContent]);
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * filter out duplicates helper function
 */
function filterDuplicates(strategyTrackerObj, firstIndx, secondIndx, rowLine, csvContentArr) {
    if (!isEmpty(rowLine[firstIndx])) {
        strategyTrackerObj[rowLine[firstIndx]] = (strategyTrackerObj[rowLine[firstIndx]] || 0) + 1;
    }    

    // if secondIndx has value then we know we need to search duplicate email and phone
    if (secondIndx && !isEmpty(rowLine[secondIndx])) {
        strategyTrackerObj[rowLine[secondIndx]] = (strategyTrackerObj[rowLine[secondIndx]] || 0) + 1;
    }

    // add row into array only if there is no duplicate
    if ((isEmpty(rowLine[firstIndx]) || strategyTrackerObj[rowLine[firstIndx]] < 2) 
        && (!secondIndx || isEmpty(rowLine[secondIndx]) || strategyTrackerObj[rowLine[secondIndx]] < 2)) {            
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
 * helper function to check if string is null or contains whitespace
 */
function isEmpty(str) {
    return (!str || /^\s*$/.test(str));
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
