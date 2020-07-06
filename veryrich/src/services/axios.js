import axios from 'axios'

function callAPI(method, url, headers, data,) {
    return axios({
        method: method,
        url: url,
        headers: headers,
        data: data,
    })

}


function getData(url) {
    return callAPI('GET', url, null, null)
}

function saveData(url, payload, method) {
    return callAPI(method, url, null, payload)
}

export { getData, saveData }
