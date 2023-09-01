import express from "express"
import cors from "cors"
import lyricsFinder from "lyrics-finder"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"
import songlyrics from 'songlyrics'
//import apiseeds from "apiseeds-lyrics"
import { setTimeout } from "timers/promises"
import { getLyrics } from "lyrics-dumper";
import { Client } from "genius-lyrics";

const lyricsFind = songlyrics.default;
//const lyricsAPI = apiseeds.default;

const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3001

app.post("/login", async (req, res) => {
  const { code } = req.body
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  })

  try {
    const {
      body: { access_token, refresh_token, expires_in },
    } = await spotifyApi.authorizationCodeGrant(code)

    res.json({ access_token, refresh_token, expires_in })
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
})

app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  })

  try {
    const {
      body: { access_token, expires_in },
    } = await spotifyApi.refreshAccessToken()
    res.json({ access_token, expires_in })
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
})

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


app.get("/lyrics", async (req, res) => {
  const { artist, track } = req.query
  const lyricString = artist + " " + track
  const lyrics = (await lyricsFinder(artist, track)) || "No Lyrics Found"
  //const lyrics = await lyricsFind(lyricString);
  res.json({ lyrics }) 
  console.log(lyrics);
  //await delay(2000);
})

app.get("/lyrics2", async (req, res) => {
  const { artist, track } = req.query
  const lyricString = artist + " " + track
  console.log(lyricString)
  let lyrics = "No Lyrics"
  try {
    lyrics = await lyricsFind(lyricString);
  } catch (error) {
    // TypeError: Failed to fetch
    console.log('There was an error', error);
  }
  res.json({ lyrics }) 
  console.log(lyrics);
})

app.get("/lyrics3", async (req, res) => {
  const client = new Client();
  const { artist, track } = req.query
  const lyricString = artist + " " + track

  try{
    const searches = await client.songs.search(lyricString);

    // Pick first one
    const firstSong = searches[0];
    console.log("About the Song:\n", firstSong, "\n");

    // Ok lets get the lyrics
    const lyrics = await firstSong.lyrics();
    console.log("Lyrics of the Song:\n", lyrics, "\n");

    res.json({ lyrics }) 
    console.log(lyrics);
  }
  catch(e){
    res.json("No Lyrics Found") 
    console.log("Skipping");
  }
})

app.get("/lyrics4", async (req, res) => {
  const { artist, track } = req.query
  const lyricString = artist + " - " + track
  console.log(lyricString)
  try{
    const lyrics = await getLyrics(lyricString);
    //const lyrics = await lyricsFind(lyricString);
    res.json({ lyrics }) 
    console.log(lyrics);
    //await delay(2000);
  }
  catch(e){
    res.json("No Lyrics Found") 
    console.log("Skipping");
  }
})

app.listen(PORT, err => {
  if (err) console.log(err)
  console.log("listening on port", PORT)
  console.log("HEY");
})