# Samis-app
* Pelaa klassista matopeliä kaksinpeliversiona.
* Pelissä madot kasvavat jatkuvasti
* Erä päättyy kun jompikumpi pelaajista osuu omaan tai vastustajan matoon
* Peli päättyy kun jompikumpi pelaajista saa viisi pistettä
* Peli koostuu kahdesta eri osasta: Palvelinpuolen ohjelmasta sekä asiakaspuolem ohjelmasta,
jotka molemmat on toteutettu javaScriptillä
* Yhteydenpito ohjelmien välillä tapahtuu Socket.IO-kehyksen avulla.

## Asiakaspuolen ohjelma
* Asiakaspuolen ohjelma suoritetaan verkkoselaimella
* Peliä pelataan nuolinäppäimillä
* Kaikki pelissä käytetty grafiikka on toteutettu P5.js-ohjelmakirjaston avulla

## Palvelinpuolen ohjelma
* Palvelinpuolen ohjelma suoritetaan Node.js:llä
* Välittää kaikki tarvittavat viestit pelaajien välillä
* Tällä hetkellä vain yksi peli voi olla kerrallaan käynnissä
