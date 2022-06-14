import fs from "fs";
import Axios from "axios";


const createFile = (localPath: string) => {
    const dirPath = localPath.slice(0, localPath.lastIndexOf('/'))
    fs.mkdirSync(dirPath, {recursive: true});
    fs.appendFileSync(localPath, '');
}

const writeFile = async (url: string, localPath: string) => {
    const file = fs.createWriteStream(localPath);

    const response = await Axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
            Accept: 'application/json',
            Authorization: 'fsq30qsTtu2N+Hrffy8eNNZMnwadhKN/KLtI3GlP/MaZewU='
        }
    })

    // pipe the result stream into a file on disc
    response.data.pipe(file)

    // return a promise and resolve when download finishes
    return new Promise<void>((resolve, reject) => {
        response.data.on('end', () => {
            resolve()
            console.log("File Downloaded!")
        })

        response.data.on('error', () => {
            reject()
            throw Error(`Could not get ${url}`)
        })
    })

}

const download = async (url: string, localPath: string) =>{
    createFile(localPath);
    await writeFile(url, localPath);
}

export {download}