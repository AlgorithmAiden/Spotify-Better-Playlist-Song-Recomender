const client_id_element = document.getElementById('client_id')
const client_secret_element = document.getElementById('client_secret')
const playlist_id_element = document.getElementById('playlist_id')
const remember_me_element = document.getElementById('remember_me')
const scan_button_element = document.getElementById('scan_button')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let width, height

function resize() {
    const body = document.body;
    const html = document.documentElement;

    width = Math.max(body.scrollWidth, body.offsetWidth,
        html.clientWidth, html.scrollWidth, html.offsetWidth, window.innerWidth);
    height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight, window.innerHeight);

    canvas.width = width
    canvas.height = height
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    console.log(width,height)
}

new MutationObserver(resize).observe(document, { childList: true, subtree: true });

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

document.addEventListener('click', e => splashes.push([e.x, e.y, 0, Math.random() * 5 + 5]))
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

if (localStorage.getItem('remember_me')) {
    remember_me_element.checked = true
    client_id_element.value = localStorage.getItem('client_id')
    client_secret_element.value = localStorage.getItem('client_secret')
    playlist_id_element.value = localStorage.getItem('playlist_id')
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
    if (Math.random() > 1.25)
        errorifyScanButton(['Invalid login', 'Invalid playlist id', 'All input fields must be filled', 'Missing internet connection to spotify servers', 'Too many requests sent, please wait'][Math.floor(Math.random() * 5)])
    else {
        addTrack('4uLU6hMCjMI75M1A2tKUQC')
    }
})

function addTrack(trackId, track) {
    let trackDiv = document.createElement('div')
    trackDiv.classList.add('track_div')
    trackDiv.innerHTML = `
    <span id="${trackId}"> ${trackId} </span>
    <div class="content">
    <button id="track_button" title="If 'remember me' is off the hidelist is reset on page load">Hide</button>
    <iframe src="https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    </div>
    `
    document.getElementById('tracks_div').appendChild(trackDiv)
    activateBetterTitles(trackDiv.querySelector('button'))
    trackDiv.querySelector('iframe').addEventListener('load', function () { this.style.opacity = 1 })
    setTimeout(() => trackDiv.classList.add('activated'), 100)

    trackDiv.querySelector('button').addEventListener('click', () => {
        document.querySelectorAll('.custom-tooltip').forEach(tooltip => {
            tooltip.classList.remove('show')
            setTimeout(() => tooltip.remove(), 500)
        })
        trackDiv.classList.add('hide')
        function shift(element, first) {
            if (first)
                element.classList.add('small_shift')
            else
                element.classList.add('shift')
            setTimeout(() => {
                const originTransition = element.style.transition
                element.style.transition = 'transform 0s ease'
                if (first)
                    element.classList.remove('small_shift')
                else
                    element.classList.remove('shift')
                setTimeout(() => element.style.transition = originTransition, 100)

            }, 2000)
            if (element.nextElementSibling != null && !element.nextElementSibling.classList.contains('hide'))
                shift(element.nextElementSibling, first)
        }
        if (trackDiv.nextElementSibling != null && !trackDiv.nextElementSibling.classList.contains('hide'))
            shift(trackDiv.nextElementSibling, trackDiv.previousElementSibling == null)
        setTimeout(() => {
            document.getElementById('tracks_div').removeChild(trackDiv)
        }, 2000)
    })
}

scan_button_element.addEventListener('click', () => {
    const start = Date.now()
    const func = () => {
        splashes.push([
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            0,
            Math.random() * 5 + 5
        ])
        if (Date.now() - start < 1000)
            setTimeout(func, Math.random() * 250)
    }
    func()
})

// const axios = require('axios')
// const qs = require('qs')
// const fs = require('fs')

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