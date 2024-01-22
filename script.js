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
}

document.addEventListener('scroll', resize)

window.onresize = resize

resize()

let splashes = []
function updateSplashes() {
    function clamp(i) { return Math.min(1, Math.max(0, i)) }
    splashes.forEach((splash, index) => {
        if (splash == undefined) return
        const grad = ctx.createRadialGradient(splash[0], splash[1], 0, splash[0], splash[1], Math.max(canvas.width, canvas.height))
        grad.addColorStop(clamp(splash[2] / 250 - .06), '#0000')
        grad.addColorStop(clamp(splash[2] / 250 - .05), '#000')
        grad.addColorStop(clamp(splash[2] / 250), `rgb(0,${255 - splash[2] * splash[3]},0)`)
        grad.addColorStop(clamp(splash[2] / 250 + .01), '#000')
        grad.addColorStop(clamp(splash[2] / 250 + .02), '#0000')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        splash[2]++
        if (255 - splash[2] * splash[3] <= -255) splashes = splashes.filter((_, subIndex) => subIndex != index)
    })
    if (splashes.length > 0) requestAnimationFrame(updateSplashes)
}

function splash() {
    splashes.push([Math.random() * window.innerWidth, Math.random() * (window.innerHeight + window.scrollY), 0, Math.random() * 5 + 5])
    if (splashes.length == 1) requestAnimationFrame(updateSplashes)
}
splash()

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

remember_me_element.addEventListener('change', () => {
    updateCheckboxText()
    if (remember_me_element.checked) {
        localStorage.setItem('remember_me', true)
        saveInfo()
    }
    else localStorage.clear()
})

let hidelist = []

if (localStorage.getItem('remember_me')) {
    remember_me_element.checked = true
    client_id_element.value = JSON.parse(localStorage.getItem('client_id'))
    client_secret_element.value = JSON.parse(localStorage.getItem('client_secret'))
    playlist_id_element.value = JSON.parse(localStorage.getItem('playlist_id'))
    hidelist = JSON.parse(localStorage.getItem('hidelist')) ?? []
    updateCheckboxText()
}

document.getElementById('client_id').addEventListener('change', () => { if (remember_me_element.checked) saveInfo() })
document.getElementById('client_secret').addEventListener('change', () => { if (remember_me_element.checked) saveInfo() })
document.getElementById('playlist_id').addEventListener('change', () => { if (remember_me_element.checked) saveInfo() })

document.querySelectorAll('[title]').forEach(element => activateBetterTitles(element))

function saveInfo() {
    localStorage.setItem('client_id', JSON.stringify(client_id_element.value))
    localStorage.setItem('client_secret', JSON.stringify(client_secret_element.value))
    localStorage.setItem('playlist_id', JSON.stringify(playlist_id_element.value))
}

let tracksToAdd = []

let scanning = false
scan_button_element.addEventListener('click', function () {
    if (scanning) return
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
    let index = 25
    const handle = setInterval(() => {
        let trail = Array(Math.abs(index - 25)).fill('-').join('')
        scan_button_element.innerText = `${trail}Scanning${trail}`
        index = (index + 1) % 50
    }, 25)
    scanning = true
    tracksToAdd = []
    for (let child of document.getElementById('tracks_div').children) {
        child.classList.remove('show')
        setTimeout(() => {
            child.remove()
        }, 2000)
    }
    scan(client_id_element.value, client_secret_element.value, playlist_id_element.value).then((response) => {
        if (response.error) {
            clearInterval(handle)
            scan_button_element.innerText = 'Scan'
            scanning = false
            errorifyScanButton(response.error)
        }
        else {
            clearInterval(handle)
            scan_button_element.innerText = 'Scan'
            scanning = false
            if (response.length > 25) {
                tracksToAdd = response.splice(25)
            }
            function addLoop(index) {
                const track = response[index]
                addTrack(track.id, track.sameness, track.recommended).then(() => {
                    if (index + 1 < Math.min(response.length, 25)) addLoop(index + 1)
                })
            }
            addLoop(0)
        }
    })
})

async function addTrack(trackId, trackSameness, recommended) {
    let shell = document.createElement('div')
    shell.classList.add('shell')
    shell.innerHTML = `
    <div class=track_div>
        <span> %${trackSameness} match </span>
        <div class="content">
            <button id="track_button" title="If 'remember me' is off the hidelist is reset on page load">Hide</button>
            <iframe src="https://open.spotify.com/embed/track/${trackId}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
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
            if (remember_me_element.checked)
                localStorage.setItem('hidelist', JSON.stringify(hidelist))
        }

        shell.classList.remove('show')
        setTimeout(() => {
            shell.remove()
        }, 2000)

        if (tracksToAdd.length > 0) {
            const track = tracksToAdd.shift()
            addTrack(track.id, track.sameness, track.recommended)
        }
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

        recommended.forEach(track => {
            let shell = document.createElement('div')
            shell.className = 'recommend_list_shell'
            shell.innerHTML = `
            <div class="recommend_list_title">${track.name}</div>
            <div class="recommend_list_subtext">${track.author}</div>
            `
            tooltip.appendChild(shell)
            shell.addEventListener('click', e => {
                window.open(`https://open.spotify.com/track/${track.id}`, '_blank')
            })
        })

        let rect = this.getBoundingClientRect()
        tooltip.style.top = rect.bottom + window.scrollY + 15 + 'px'
        tooltip.style.display = 'block'

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


    const iframe = shell.querySelector('iframe')

    await new Promise((resolve, reject) => {
        iframe.onload = () => resolve()
        iframe.onerror = () => reject(console.log('Iframe failed to load'))
    })

    return
}

const scan = (() => {
    async function getToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET) {
        const url = 'https://accounts.spotify.com/api/token'
        const token = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)

        const params = new URLSearchParams()
        params.append('grant_type', 'client_credentials')

        const headers = new Headers({
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: params,
                headers: headers
            });

            const data = await response.json()
            if (data.access_token == undefined) return { error: 'Invalid login' }
            return data.access_token
        } catch (error) {
            return { error: 'Bad connection' }
        }
    }
    async function getPlaylistSongs(playlistId, token) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                return { error: 'Network response was not ok' }
            }

            const data = await response.json()
            return data.items.map(item => item.track)
        } catch (error) {
            return { error: 'Error in getting tracks from the playlist' }
        }
    }
    async function getRecommendations(trackId, token) {
        const url = new URL('https://api.spotify.com/v1/recommendations')
        url.search = new URLSearchParams({
            seed_tracks: trackId,
            limit: 100
        })

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!response.ok) {
                if (response.status === 429) {
                    const wait = parseInt(response.headers.get('Retry-After')) * 1000 + 1000
                    return { error: `Too many requests, waiting ${Math.ceil(wait / 1000)} seconds` }
                }
                return { error: `HTTP error! status: ${response.status}` }
            }

            const data = await response.json()
            return data.tracks
        } catch (error) {
            return { error: 'Error in getting recommendations' }
        }
    }
    return async (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, PLAYLIST_ID) => {

        const token = await getToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
        if (token.error) return token
        const playlistTracks = await getPlaylistSongs(PLAYLIST_ID, token)
        if (playlistTracks.error) return playlistTracks
        let trackPromises = []
        let results = []
        for (const track of playlistTracks) {
            trackPromises.push(new Promise(async (resolve, reject) => {
                const recommended = await getRecommendations(track.id, token)
                if (recommended.error) {
                    reject(recommended.error)
                }
                results.push({ track, recommended })
                splash()
                resolve()
            }))
        }
        try {
            await Promise.all(trackPromises)
        } catch (error) {
            return { error }
        }
        let tracks = {}
        if (remember_me_element.checked)
            tracks = JSON.parse(localStorage.getItem('tracks')) ?? {}
        for (const result of results) {
            for (const track of result.recommended) {
                if (tracks[track.id] == undefined) {
                    tracks[track.id] = {
                        sameness: 1,
                        recommended: [
                            { name: result.track.name, author: result.track.artists[0].name, id: result.track.id }
                        ]
                    }
                } else if (!tracks[track.id].recommended.map(item => item.id).includes(track.id)) {
                    tracks[track.id].sameness++
                tracks[track.id].recommended.push({ name: result.track.name, author: result.track.artists[0].name, id: result.track.id })
            }
        }
    }
    if (remember_me_element.checked)
        localStorage.setItem('tracks', JSON.stringify(tracks))
    let sortedTracks = []
    for (const trackId in tracks) {
        sortedTracks.push({ id: trackId, recommended: tracks[trackId].recommended, sameness: Math.round(tracks[trackId].sameness / playlistTracks.length * 100) })
    }
    sortedTracks = sortedTracks.sort((a, b) => b.sameness - a.sameness)
    sortedTracks = sortedTracks.filter(track => !hidelist.includes(track.id))
    sortedTracks = sortedTracks.filter(track => !playlistTracks.map(subTrack => subTrack.id).includes(track.id))
    return sortedTracks
}
}) ()