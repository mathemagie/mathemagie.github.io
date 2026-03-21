# Plan Audio - 3615 TERRE

## Analyse de l'existant

### Architecture audio actuelle

Le projet utilise une pipeline audio en 3 etapes :

1. **Source de donnees** : Archive.org collection `radio-aporee-maps`
   - Requete bulk : `advancedsearch.php?q=collection:radio-aporee-maps&fl[]=identifier,title,creator,coverage&rows=5000`
   - Charge ~5000 enregistrements d'un coup, parse le champ `coverage` pour extraire lat/lng
   - Cache localStorage 24h pour eviter de re-fetcher

2. **Selection par proximite** : Haversine distance ISS <-> sound location
   - `findNearestSoundLocation()` : brute-force O(n) sur les 5000 points
   - Optimisation : skip si ISS a bouge < 50km depuis la derniere recherche
   - Signal quality degrade avec la distance (< 500km = parfait, > 5000km = faible)

3. **Lecture audio** : WebAudio API + 2 elements `<audio>` pour crossfade
   - Fetch metadata individuelle par identifier : `archive.org/metadata/{id}`
   - Cherche le fichier MP3 original, construit l'URL de telechargement
   - Crossfade entre 2 players avec GainNode automation
   - Filtre passe-bas + bruit blanc pour simuler degradation signal
   - Lecture en boucle (`loop = true`)

### Problemes identifies

| Probleme | Impact |
|----------|--------|
| **Pas de streaming reel** - telecharge le MP3 complet avant lecture | Latence initiale elevee, consommation bande passante |
| **Source unique** - seulement archive.org/radio-aporee | Couverture geographique limitee (zones sans enregistrements = silence) |
| **Pas d'API officielle aporee** - aporee.org deconseille le scraping de masse | Risque de blocage, dependance fragile |
| **CORS** - archive.org sert avec `crossorigin="anonymous"` mais pas garanti | WebAudio `createMediaElementSource` peut echouer silencieusement |
| **5000 items max** - limite arbitraire de `SOUND_BATCH_SIZE` | Ne couvre pas toute la collection (~50k+ items) |
| **Pas de fallback** - si aucun son proche, rien ne joue | Experience vide au-dessus des oceans |

---

## Sources audio alternatives

### 1. Freesound API (recommande en complement)

- **URL** : `https://freesound.org/apiv2/`
- **Geotag natif** : `filter={!geofilt sfield=geotag pt=LAT,LNG d=DIST_KM}`
- **Avantages** :
  - Recherche spatiale native (point + rayon)
  - 500k+ sons, beaucoup geotagges
  - Previews streamables (MP3 basse qualite sans auth, HQ avec token)
  - Licence CC claire par son
- **Limites** :
  - Necessite une API key (gratuite, inscription requise)
  - Rate limit : ~2000 req/jour (gratuit)
  - Pas tous les sons sont geotagges
  - Preview URLs expirent (pas de lien permanent stable)
- **Integration** : ideal pour combler les trous geographiques d'aporee

**Exemple de requete** :
```
GET https://freesound.org/apiv2/search/text/?
  filter={!geofilt sfield=geotag pt=48.8566,2.3522 d=50}
  &fields=id,name,previews,geotag,tags
  &token=YOUR_KEY
```

Sources :
- [Freesound API v2 docs](https://freesound.org/docs/api/resources_apiv2.html)
- [Freesound geotag map](https://freesound.org/browse/geotags/)

---

### 2. Radio Browser API (radios live par pays/region)

- **URL** : `https://all.api.radio-browser.info/json/stations/search`
- **90 000+ stations** mondiales avec metadata pays, langue, genre
- **Avantages** :
  - 100% gratuit, open source, pas d'API key
  - Retourne des URLs de stream directement jouables (`url_resolved`)
  - Formats de sortie : JSON, M3U, PLS
  - Champ `geo_lat`/`geo_long` sur certaines stations
  - Parametre `has_geo_info=true` pour filtrer
- **Limites** :
  - Pas de recherche par rayon geographique (filtrage client-side necessaire)
  - Streams live = pas de boucle, contenu imprevisible
  - CORS variable selon les stations (certaines bloquent le navigateur)
  - Qualite et fiabilite variable
- **Integration** : fallback ideal quand aucun field recording n'est disponible - jouer une radio locale du pays survole

**Exemple** :
```
GET https://all.api.radio-browser.info/json/stations/search?
  countrycode=FR&has_geo_info=true&limit=5&order=clickcount&reverse=true
```

Sources :
- [Radio Browser API docs](https://docs.radio-browser.info/)
- [Radio Browser GitHub](https://github.com/ivandotv/radio-browser-api)

---

### 3. Aporee.org stream natif

- **URL** : `https://radio.aporee.org/`
- **Stream intelligent** qui selectionne des enregistrements en fonction de la localisation
- **Avantages** :
  - Source la plus coherente avec le concept du projet
  - Stream continu, pas besoin de gerer la playlist
- **Limites** :
  - **Pas d'API publique documentee** (confirme par aporee.org : "there is no public API so far")
  - Deconseille explicitement les scripts automatises
  - Contact requis pour acces programmatique : radio@aporee.org
- **Integration** : possible seulement avec accord formel du projet

Source : [aporee.org info](https://aporee.org/maps/info/)

---

### 4. Cities and Memory

- **URL** : `https://citiesandmemory.com/sound-map/`
- **8000+ enregistrements** dans 140 pays
- **Avantages** : double version (field recording + composition artistique)
- **Limites** : pas d'API publique connue, acces programmatique non documente
- **Integration** : non viable sans API

Source : [Cities and Memory](https://citiesandmemory.com/)

---

## Strategie recommandee : sources hybrides

```
ISS position
    |
    v
[1] Archive.org / radio-aporee-maps  (field recordings geotagges)
    |-- son trouve < 500km ? --> JOUER avec signal quality
    |
    v (fallback)
[2] Freesound API  (field recordings geotagges CC)
    |-- son trouve < 100km ? --> JOUER
    |
    v (fallback)
[3] Radio Browser API  (radio live du pays survole)
    |-- station trouvee ? --> JOUER avec indicateur "RADIO LOCALE"
    |
    v (fallback ultime)
[4] Ambiance generative  (WebAudio oscillators + bruit)
    --> Son generatif base sur lat/lng (frequence = latitude, texture = biome)
```

### Priorite d'implementation

| Phase | Action | Effort | Impact |
|-------|--------|--------|--------|
| **P0** | Augmenter `SOUND_BATCH_SIZE` ou paginer la collection aporee | Faible | Couvre mieux la collection existante |
| **P1** | Integrer Freesound API avec geotag search | Moyen | Double la couverture geographique |
| **P2** | Ajouter Radio Browser comme fallback radio live | Moyen | Elimine les silences au-dessus des oceans |
| **P3** | Ambiance generative WebAudio en dernier recours | Moyen | Zero silence garanti |
| **P4** | Prefetch : anticiper la trajectoire ISS et pre-charger les sons a venir | Eleve | Transitions fluides, zero latence |

---

## Detail technique : streaming vs download

### Situation actuelle (download complet)

```
User click --> fetch metadata --> fetch MP3 (entier) --> decode --> play
                                  ~~~~ 2-10s latence ~~~~
```

### Amelioration possible : streaming progressif

**Option A : `<audio>` avec URL directe** (actuel, mais optimisable)
- L'element `<audio>` fait deja du streaming HTTP range requests
- Le navigateur commence a jouer avant la fin du download
- Probleme : archive.org est parfois lent au premier byte

**Option B : MediaSource Extensions (MSE)**
- Controle fin sur le buffering
- Permet de switcher de source sans interruption
- Complexite elevee, pas forcement necessaire ici

**Option C : Prefetch intelligent**
```javascript
// Predire la prochaine position ISS dans 30s
const nextLat = issData.latitude + (issData.velocity * 30 / 111);
const nextLng = issData.longitude + ...;
// Pre-fetcher le prochain son pendant que le courant joue
prefetchNextSound(nextLat, nextLng);
```

**Recommandation** : Option A + C (garder `<audio>` natif + ajouter prefetch predictif)

---

## Notes sur les contraintes CORS

| Source | CORS | Solution |
|--------|------|----------|
| Archive.org | OK (`Access-Control-Allow-Origin: *`) | Direct |
| Freesound previews | OK (headers CORS) | Direct |
| Radio Browser streams | Variable | Tester par station, fallback si bloque |
| Aporee.org stream | Non teste | Probablement bloque sans proxy |

Pour les streams radio bloques par CORS :
- Utiliser un element `<audio src="...">` sans `crossorigin` (pas de WebAudio processing possible)
- Ou deployer un petit proxy CORS (Cloudflare Worker, Vercel edge function)

---

## References

- [Freesound API v2 documentation](https://freesound.org/docs/api/resources_apiv2.html)
- [Radio Browser API docs](https://docs.radio-browser.info/)
- [radio aporee maps info](https://aporee.org/maps/info/)
- [archive.org radio-aporee-maps collection](https://archive.org/details/radio-aporee-maps)
- [Cities and Memory sound map](https://citiesandmemory.com/sound-map/)
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)
- [Radio Browser GitHub wrapper](https://github.com/ivandotv/radio-browser-api)
