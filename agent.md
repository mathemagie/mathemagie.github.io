# agent.md — instructions pour l'agent

## Cache busting (cache-feu)

À **chaque** modification d'un fichier CSS ou JS dans un projet de ce dépôt,
l'agent doit mettre à jour le hash de cache-busting dans le HTML correspondant.
Sinon les visiteurs continueront à recevoir l'ancienne version depuis le cache
de leur navigateur.

### Procédure

1. Recalculer le hash SHA-1 court (8 premiers caractères) du fichier modifié :
   ```
   shasum -a 1 chemin/vers/fichier.css chemin/vers/fichier.js
   ```
2. Reporter les nouveaux hashes dans le `index.html` qui charge ces fichiers,
   sous la forme `?v=<hash>` :
   ```html
   <link rel="stylesheet" href="css/styles.css?v=NOUVEAU_HASH">
   <script src="js/script.js?v=NOUVEAU_HASH"></script>
   ```
3. Inclure cette mise à jour dans le même commit que la modification CSS/JS.

### Projets concernés

- `bidouille/rotary_phone/` — `css/styles.css`, `js/script.js`, chargés par `index.html`.

(Étendre cette liste au fur et à mesure que d'autres projets adoptent le cache-busting.)
