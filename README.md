Ever had a playlist is spotify with a *very* specific theme? But spotify's default search is *wayyy* too vague to get any results? If you answered yes, then this website is for you!
SBPSR (Spotify Better Playlist Song Recommender) does a few things:

 ~ It scans the given playlist
 
 ~ Gets up to 100 recommended songs for each song in said playlist
 
 ~ Measures how many songs recommend any one song (measured in "sameness")
 
 ~ Hides any unwanted songs (either hidden by the user, or because its already in the playlist)
 
 ~ Sorts the remaining songs by sameness
 
 ~ Displays the top 25 songs (and puts the rest in storage)

That's it! Or at least that's the core functionality, in reality there are *many* small things for a better experience, such as:

 ~ A 'Remember Me' toggle to store login info / hidelist
 
 ~ A hidelist to block songs that keep getting recommended that you don't want
 
 ~ A button next to every song to add it to the hidelist and smoothly remove itself
 
 ~ Extra songs in storage get added to the screen as old ones get hidden
 
 ~ Song images get loaded one at a time for less lag
 
 ~ A menu for every song showing what songs recommended it

 ~ Hover effects on almost everything

 ~ A really nice clean theme

 ~ And last, and probably least, a direct link to this page for new users

Setup:

You will need a spotify client id and spotify client secret, and the playlist id for the target playlist.

To get the client id / secret, 
go to https://developer.spotify.com/ and create an account / sign in, 
go to the dashboard, and create a new app, under the app's settings you will find the needed keys.

To get the playlist id simply grab it from the URL, so for https://open.spotify.com/playlist/1S1INS2v0Yr7fOY3QoVJCw?si=697ba7a84f474630 you would need 1S1INS2v0Yr7fOY3QoVJCw

NOTE: this website does not store *any* information if remember me is set to off, and no information is every sent to anything other than to spotify as needed

That's it! Let me know if you find any bugs.
