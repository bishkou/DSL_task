import axios from "axios";
import {get, set} from "lodash";
import {download} from "./download";
import {fetchData} from "./fetch";


const keywords = ['download', 'fetch', 'foreach'];

// checks if URL is accessible
const tryFetch = async (url: string) => {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: 'fsq30qsTtu2N+Hrffy8eNNZMnwadhKN/KLtI3GlP/MaZewU='
        }
    };
    try {
        await axios.get(url, options);
    } catch (err) {
        return false;
    }
    return true;
}

// if a line has {p.url} we replace them with their respective value
const treatBrackets = (line :string, lineTokens: Array<string>, prevResult: any) => {
    const regex: RegExp = /{[A-z0-9-_+.]+}/g;
    let found: RegExpMatchArray | null = line.match(regex);
    if (found) {
        found.map(reg => {
            const key: string = reg.substring(1, reg.length - 1); //taking the string inside the {}
            let value: any = get(prevResult, key); //getting the value of that key from prevResult

            if (typeof value === 'number')
                value = value.toString();
            //replacing the {} and if there are any overlaped slashes
            line = line.replaceAll(reg, value);
            line = line.replaceAll('//', '/');
            line = line.replaceAll('https:/', 'https://');
            lineTokens[1] = line.split(' ')[1];
            lineTokens[2] = line.split(' ')[2];
        })
    } else throw Error('No match found')
}

const interpretLine = async (line: string, prevResult: any) => {
    let lineTokens: Array<string> = line.split(' '),
        tokenLen: number = lineTokens.length;
    if (tokenLen !== 3)
        throw Error('Invalid line');

    if (keywords.includes(lineTokens[0])){
        if (lineTokens[0] === 'download'){
            if (line.includes('{')) {
                treatBrackets(line, lineTokens, prevResult);
            }
            //ex: p.url
            if(!(await tryFetch(lineTokens[1]))) {
                lineTokens[1] = get(prevResult, `${lineTokens[1]}`);
            }
            const localPath = get(prevResult, `${lineTokens[2]}`)
            if (localPath) //ex: p.localpath
                lineTokens[2] = localPath

            if (!await tryFetch(lineTokens[1]))
                throw Error(`Could not get ${lineTokens[1]}`);
            await download(lineTokens[1], lineTokens[2]);

        }
        else if (lineTokens[0] === 'fetch') {
            let value: any;
            //ex: https://google.com
            if(await tryFetch(lineTokens[2])) {
                value = await fetchData(lineTokens[2]);
            }
            //ex: https://{p.url}
            else if (lineTokens[2].includes('{')){
                treatBrackets(line, lineTokens, prevResult);
                value = await fetchData(lineTokens[2]);
            }
            //ex: p.url
            else {
                value = get(prevResult, `${lineTokens[2]}`)
            }

            if (!await tryFetch(lineTokens[2]))
                throw Error(`Could not get ${lineTokens[2]}`);
            set(prevResult, `${lineTokens[1]}`, value);

        }
    }

}

const setForEach = async (variable: string, path: string, prevResult: any) => {
    const result: any = get(prevResult, path);
    set(prevResult, variable, result);
}

export {interpretLine, setForEach}