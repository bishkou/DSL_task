import axios from "axios";

const fetchData = async (url: string) => {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: 'fsq30qsTtu2N+Hrffy8eNNZMnwadhKN/KLtI3GlP/MaZewU='
        }
    };
    const res = await axios.get(url, options)
        .catch(error => {
            throw Error(`Could not get ${url}`);
        });
    return res.data;
}

export { fetchData };