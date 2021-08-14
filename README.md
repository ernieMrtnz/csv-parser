# CSV Parser

## Description
```
The CSV Parser is built using NodeJS. It has a command line (commander) package that allows for user input.
```

## How to run script from command line
First:
```
Open a Terminal and cd into the project directory
```

Next we need to install the node packages (babel, jest, commander). We do this with this command:
```
npm istall
```

Now we can start the csv parser by running this command:
```
node csv-parser-cli.js -f <filename> -s <duplicateStrategy>
```
*** Note: Replace the <filename> and <duplicateStrategy> with a filename that is found in /csv-files, and duplicateStrategy with email, phone, or both ***


### Run the test suite
```
npm run test
```