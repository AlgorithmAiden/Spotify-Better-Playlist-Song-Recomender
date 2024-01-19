const client_id_element = document.getElementById('client_id')
const client_secret_element = document.getElementById('client_secret')
const playlist_id_element = document.getElementById('playlist_id')
const remember_me_element = document.getElementById('remember_me')
const scan_button_element = document.getElementById('scan_button')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let width, height

function resize() {
    canvas.width = 0
    canvas.height = 0

    const body = document.body;
    const html = document.documentElement;

    width = Math.max(body.scrollWidth, body.offsetWidth,
        html.clientWidth, html.scrollWidth, html.offsetWidth, window.innerWidth)
    height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight, window.innerHeight) + 25

    canvas.width = width
    canvas.height = height
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    console.log(width, height)
}

document.addEventListener('scroll', resize)

window.onresize = resize

resize()

let splashes = []
function updateSplashes() {
    function clamp(i) { return Math.min(1, Math.max(0, i)) }
    splashes.forEach(splash => {
        const grad = ctx.createRadialGradient(splash[0], splash[1], 0, splash[0], splash[1], Math.max(canvas.width, canvas.height))
        grad.addColorStop(clamp(splash[2] / 250 - .06), '#0000')
        grad.addColorStop(clamp(splash[2] / 250 - .05), '#000')
        grad.addColorStop(clamp(splash[2] / 250), `rgb(0,${255 - splash[2] * splash[3]},0)`)
        grad.addColorStop(clamp(splash[2] / 250 + .01), '#000')
        grad.addColorStop(clamp(splash[2] / 250 + .02), '#0000')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        splash[2]++
        if (splash[2] > 500) splash = undefined
    })
    requestAnimationFrame(updateSplashes)
}
requestAnimationFrame(updateSplashes)

function updateCheckboxText() {
    document.getElementById('remember_me_text').style.color = remember_me_element.checked ? '#0f0' : '#666'
}
updateCheckboxText()

function activateBetterTitles(element) {
    let handle
    element.addEventListener('mouseenter', function () {
        let titleText = this.getAttribute('title')
        this.setAttribute('data-title', titleText)
        this.removeAttribute('title')

        let tooltip = document.createElement('div')
        tooltip.className = 'custom-tooltip'
        tooltip.textContent = titleText
        document.body.appendChild(tooltip)

        let rect = this.getBoundingClientRect()
        tooltip.style.top = rect.bottom + window.scrollY + 'px'
        tooltip.style.display = 'block'

        handle = setTimeout(() => tooltip.classList.add('show'), 250)
    })

    element.addEventListener('mouseleave', function () {
        clearTimeout(handle)
        document.querySelectorAll('.custom-tooltip').forEach(tooltip => {
            tooltip.classList.remove('show')
            setTimeout(() => tooltip.remove(), 500)
        })
        this.setAttribute('title', this.getAttribute('data-title'))
    })
}

function errorifyScanButton(errorMessage) {
    clearTimeout(errorifyScanButton.token)
    scan_button_element.classList.add('swell')
    scan_button_element.style.backgroundColor = '#300'
    scan_button_element.style.borderColor = '#f00'
    scan_button_element.style.color = '#f00'
    scan_button_element.textContent = errorMessage
    errorifyScanButton.token = setTimeout(() => {
        scan_button_element.classList.remove('swell')
        scan_button_element.style.backgroundColor = '#333'
        scan_button_element.style.borderColor = '#666'
        scan_button_element.style.color = '#0f0'
        scan_button_element.textContent = 'Scan'
    }, 1500)
}

let hidelist = []

if (localStorage.getItem('remember_me')) {
    remember_me_element.checked = true
    client_id_element.value = localStorage.getItem('client_id')
    client_secret_element.value = localStorage.getItem('client_secret')
    playlist_id_element.value = localStorage.getItem('playlist_id')
    hidelist = localStorage.getItem('hidelist')
    if (typeof hidelist != 'object') hidelist = []
    updateCheckboxText()
}

remember_me_element.addEventListener('change', () => {
    updateCheckboxText()
    if (remember_me_element.checked) {
        localStorage.setItem('remember_me', true)
        saveInfo()
    }
    else {
        localStorage.clear()
    }
})

document.getElementById('client_id').addEventListener('change', () => { if (remember_me_element.checked) saveInfo() })
document.getElementById('client_secret').addEventListener('change', () => { if (remember_me_element.checked) saveInfo() })
document.getElementById('playlist_id').addEventListener('change', () => { if (remember_me_element.checked) saveInfo() })

document.querySelectorAll('[title]').forEach(element => activateBetterTitles(element))

function saveInfo() {
    localStorage.setItem('client_id', client_id_element.value)
    localStorage.setItem('client_secret', client_secret_element.value)
    localStorage.setItem('playlist_id', playlist_id_element.value)
}

document.getElementById('scan_button').addEventListener('click', function () {
    if (client_id_element.value == '') {
        errorifyScanButton('Missing spotify client ID')
        return
    }
    if (client_secret_element.value == '') {
        errorifyScanButton('Missing spotify client secret')
        return
    }
    if (playlist_id_element.value == '') {
        errorifyScanButton('Missing spotify playlist ID')
        return
    }
    addTrack('4uLU6hMCjMI75M1A2tKUQC', Math.round(Math.random() * 100), [['Never gonna Give You Up', 'Rick Astley', '4uLU6hMCjMI75M1A2tKUQC'], ['Never gonna Give You Up', 'Rick Astley', '4uLU6hMCjMI75M1A2tKUQC'], ['Never gonna Give You Up', 'Rick Astley', '4uLU6hMCjMI75M1A2tKUQC'], ['Never gonna Give You Up', 'Rick Astley', '4uLU6hMCjMI75M1A2tKUQC'], ['Never gonna Give You Up', 'Rick Astley', '4uLU6hMCjMI75M1A2tKUQC']])
})

function addTrack(trackId, trackRating, stats = []) {
    let shell = document.createElement('div')
    shell.classList.add('shell')
    shell.innerHTML = `
    <div class=track_div>
        <span> %${trackRating} match </span>
        <div class="content">
            <button id="track_button" title="If 'remember me' is off the hidelist is reset on page load">Hide</button>
            <iframe src="https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        </div>
    </div>
    `
    document.getElementById('tracks_div').appendChild(shell)
    activateBetterTitles(shell.querySelector('button'))
    shell.querySelector('iframe').addEventListener('load', function () { this.style.opacity = 1 })
    setTimeout(() => shell.classList.add('show'), 100)

    shell.querySelector('button').addEventListener('click', () => {

        if (!hidelist.includes(trackId)) {
            hidelist.push(trackId)
            console.log(hidelist)
            if (remember_me_element.checked)
                localStorage.setItem('hidelist', hidelist)
        }

        shell.classList.remove('show')
        setTimeout(() => shell.remove(), 2000)
    })

    let enter_handle
    let leave_handle

    let open = false

    function enter() {
        clearTimeout(leave_handle)
        if (open) return
        tooltip = document.createElement('div')
        tooltip.className = 'recommend_list'
        tooltip.textContent = 'Recommended by:'
        document.body.appendChild(tooltip)

        stats.forEach(stat => {
            let shell = document.createElement('div')
            shell.className = 'recommend_list_shell'
            shell.innerHTML = `
            <div class="recommend_list_title">${stat[0]}</div>
            <div class="recommend_list_subtext">${stat[1]}</div>
            `
            tooltip.appendChild(shell)
            shell.addEventListener('click', e => {
                window.open(`https://open.spotify.com/track/${stat[2]}`, '_blank')
            })
        })

        let rect = this.getBoundingClientRect()
        tooltip.style.top = rect.bottom + window.scrollY + 15 + 'px'
        tooltip.style.display = 'block'

        console.log(tooltip.getBoundingClientRect().top, window.scrollY)

        tooltip.addEventListener('mouseenter', enter)
        tooltip.addEventListener('mouseleave', leave)

        open = true

        enter_handle = setTimeout(() => {
            const children = tooltip.children
            for (let index = 0; index < children.length; index++) {
                setTimeout(() => children[index].classList.add('show'), (index + 1) * 100)
            }
            tooltip.classList.add('show')
        }, 100)
    }
    function leave() {
        leave_handle = setTimeout(() => {
            clearTimeout(enter_handle)
            open = false
            document.querySelectorAll('.recommend_list').forEach(tooltip => {
                tooltip.classList.remove('show')
                setTimeout(() => {
                    tooltip.remove()
                }, 500)
            })
        }, 100)
    }

    shell.querySelector('span').addEventListener('mouseenter', enter)
    shell.querySelector('span').addEventListener('mouseleave', leave)
}

// const

// const axios = require('axios')
// const qs = require('qs')

// const SPOTIFY_CLIENT_ID = ''
// const SPOTIFY_CLIENT_SECRET = ''
// const PLAYLIST_ID = ''

// async function getSpotifyAccessToken() {
//     const credentials = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
//     const token = Buffer.from(credentials).toString('base64')
//     try {
//         const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({ grant_type: 'client_credentials' }), {
//             headers: {
//                 'Authorization': `Basic ${token}`,
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//         })

//         return response.data.access_token
//     } catch (error) {
//         console.error('Error in getting access token:', error)
//         return null
//     }
// }

// async function getRecommendations(trackId, accessToken) {
//     try {
//         const response = await axios.get('https://api.spotify.com/v1/recommendations', {
//             headers: { 'Authorization': `Bearer ${accessToken}` },
//             params: {
//                 seed_tracks: trackId,
//                 limit: 100
//             }
//         })

//         return response.data.tracks
//     } catch (error) {
//         if (error.response.statusText == 'Too Many Requests') {
//             const wait = parseInt(error.response.headers['retry-after']) + 1000
//             console.log(`Too may requests, waiting ${wait} seconds`)
//             await new Promise(r => setTimeout(r, wait))
//             return getRecommendations(trackId, accessToken * 1000)
//         }
//         console.error('Error in getting recommendations:', error)
//         return []
//     }
// }

// async function getPlaylistSongs(playlistId, accessToken) {
//     try {
//         const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
//             headers: { 'Authorization': `Bearer ${accessToken}` }
//         });

//         return response.data.items.map(item => item.track); // Extracting track information from each item
//     } catch (error) {
//         console.error('Error in getting tracks from playlist:', error);
//         return [];
//     }
// }

// (async () => {
//     const accessToken = await getSpotifyAccessToken()
//     const tracks = await getPlaylistSongs(PLAYLIST_ID, accessToken)
//     let allRecommendations = {}
//     console.log('Getting recommended songs')
//     let getRecommendationPromises = []
//     let progress = 0
//     for (let index = 0; index < tracks.length; index++) {
//         getRecommendationPromises.push(new Promise(async r => {
//             const track = tracks[index]
//             const recommendations = await getRecommendations(track.id, accessToken)
//             for (let subIndex = 0; subIndex < recommendations.length; subIndex++) {
//                 const recommendation = recommendations[subIndex]
//                 if (allRecommendations[recommendation.name] != undefined)
//                     allRecommendations[recommendation.name].sameness++
//                 else
//                     allRecommendations[recommendation.name] = {
//                         ...recommendation,
//                         sameness: 1
//                     }
//             }
//             progress++
//             console.log(`%${Math.round(progress / tracks.length * 100)}`)
//             r()
//         }))
//     }
//     await Promise.all(getRecommendationPromises)
//     let sortedSongs = []
//     for (const name in allRecommendations) {
//         const song = allRecommendations[name]
//         if (!(tracks.map(track => track.id)).includes(song.id))
//             sortedSongs.push(song)
//     }
//     const ignore = fs.readFileSync('ignore.txt', 'utf8').split('\n').map(item => item.split('\r')[0])
//     sortedSongs = sortedSongs.filter(song => !ignore.includes(song.name))
//     sortedSongs = sortedSongs.sort((a, b) => b.sameness - a.sameness)
//     console.log(`Recommending ${sortedSongs.length} songs just for you!`)
//     console.log(`Give ${sortedSongs[0].name} a listen at ${sortedSongs[0].external_urls.spotify}`)
//     sortedSongs = sortedSongs.map(song => `${song.name} is a %${Math.round(song.sameness / tracks.length * 100)} match, you can find it at ${song.external_urls.spotify}`)
//     fs.writeFileSync('recommended_songs', sortedSongs.join('\r'), 'utf8')
//     console.log('Done')
// })()