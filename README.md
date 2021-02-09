# Snake Battle
* Play the classic worm game as a two-player version.
* In the game, worms are constantly growing
* The round ends when either player hits his own or an opponent's worm
* The game ends when either player gets five points
* The game consists of two parts: a server-side program, as well as client-side program,
both implemented in javaScript
* Communication between programs is done using the Socket.IO framework.
* Play the game at http://samis-app.herokuapp.com/

## Client-side program
* Client-side program is executed from a web browser
* The game can be played with the arrow keys or touch screen
* All graphics used in the game are implemented using the P5.js program library

## Server-side program
* The server-side program is executed with Node.js
* Forwards all necessary messages between the players
* Currently, only one game can be run at a time

# Snake Battle
* Pelaa klassista matopeliä kaksinpeliversiona.
* Pelissä madot kasvavat jatkuvasti
* Erä päättyy kun jompikumpi pelaajista osuu omaan tai vastustajan matoon
* Peli päättyy kun jompikumpi pelaajista saa viisi pistettä
* Peli koostuu kahdesta eri osasta: Palvelinpuolen ohjelmasta sekä asiakaspuolen ohjelmasta,
jotka molemmat on toteutettu javaScriptillä
* Yhteydenpito ohjelmien välillä tapahtuu Socket.IO-kehyksen avulla.
* Pelaa peliä osoitteessa http://samis-app.herokuapp.com/

## Asiakaspuolen ohjelma
* Asiakaspuolen ohjelma suoritetaan verkkoselaimella
* Peliä pelataan nuolinäppäimillä tai kosketusnäytöllä
* Kaikki pelissä käytetty grafiikka on toteutettu P5.js-ohjelmakirjaston avulla

## Palvelinpuolen ohjelma
* Palvelinpuolen ohjelma suoritetaan Node.js:llä
* Välittää kaikki tarvittavat viestit pelaajien välillä
* Tällä hetkellä vain yksi peli voi olla kerrallaan käynnissä
