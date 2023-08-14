const fs = require('fs')

const {client_id, client_secret} = JSON
    .parse(fs.readFileSync('./secrets.json'))

run()

async function run() 
{
    const token = await fetchToken(client_id, client_secret)

    let url = 'https://api.spotify.com/v1/shows/2sMZ4pz3gruOANE9RtTf65/episodes?offset=0&limit=50&market=NO'
    const episodes = []
    let response
    let finished = false
    do {
        response = await fetchEpisodes(url, token)
        for(const episode of response.items)
        {
            episodes.push(episode)
        }
        url = response.next
        finished = ! url
    } while(!finished)
    const dmEpisodes = episodes.filter(e =>
        {
            const pattern = /How To DM/i
            return (
                e.description.match(pattern) ||
                e.name.match(pattern)
            )
        })
    fs.writeFileSync('./episodes.json', JSON.stringify(dmEpisodes, null, 4))
    console.log(`"How to DM" episodes: ${dmEpisodes.length}/${episodes.length}`)
}

async function fetchEpisodes(url, token)
{
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + token);

    const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    const response = await fetch(url, requestOptions)
    const responseBody = await response.json()

    return responseBody
}

async function fetchToken(id, secret)
{
    const tokenUrl = 'https://accounts.spotify.com/api/token'

    const authString =
        'Basic ' +
        Buffer.from(id +
        ':' +
        secret).toString('base64')

    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')
    myHeaders.append('Authorization', authString)
    
    const urlencoded = new URLSearchParams()
    urlencoded.append('grant_type', 'client_credentials')
    
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    }

    const response = await fetch(tokenUrl, requestOptions)
    const tokenResponseBody = await response.json()

    return tokenResponseBody.access_token
}

console.log('ok')