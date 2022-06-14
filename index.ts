import * as fs from 'fs';
import {interpretLine, setForEach} from "./utils";
import {get} from 'lodash'


const lineByline = async (data: string) => {
    let lines: Array<string> = data.split('\n');
    lines = lines.map(line => line.trim());
    let lineIndex: number = 0;
    let prevResult = {}; //object to store all variables
    while (lineIndex < lines.length){
        let lineTokens: Array<string> = lines[lineIndex].split(' ');
        if (lineTokens[0] === 'foreach'){
            let i = 0;
            const variable = lineTokens[1];
            const res = get(prevResult, lineTokens[2]) //the array fetched previously
            let start = lineIndex; //foreach line
            start++;
            while (i< res.length) {
                //save the ith element in the variable
                await setForEach(variable, `${lineTokens[2]}[${i}]`, prevResult);
                while (start < lines.length) {
                    await interpretLine(lines[start], prevResult);
                    start++;
                }
                i++;
                start = lineIndex; //start again from the foreach line
                start++;
            }
            lineIndex = start;
        } else {
            await interpretLine(lines[lineIndex], prevResult);
        }
        lineIndex++;
    }
}



const data = fs.readFileSync('./example.txt', 'utf8');
lineByline(data)



