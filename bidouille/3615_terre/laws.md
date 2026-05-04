# Méthodo : simplifier en 10 itérations avec les Lois de Maeda

*(Brouillon Facebook)*

---

J'ai passé une soirée à appliquer **les 10 Lois de la Simplicité de John Maeda** sur une de mes œuvres web, *3615 TERRE* — une radio qui capte le son du lieu que survole l'ISS en temps réel.

La règle du jeu :
- À chaque itération, je demande à l'agent IA d'**auditer l'écran loi par loi**.
- Il me rend un tableau : *Loi · Manque actuel · Fix concret*.
- Je choisis 2–3 mouvements à plus fort levier.
- On code. On commit. On recommence.

**Résultat après 10+ itérations** :

| Avant | Après |
|---|---|
| 24 barres FFT en cercle | 1 barre orbitale qui suit la vraie position ISS |
| Slider de volume + bouton mute | Le disque lui-même est l'audio (clic = mute) |
| Titre "3615 TERRE" en haut de page | Titre caché — découvrable via un picto "i" minuscule |
| Intro de 5 lignes au lancement | 2 lignes : titre + "Mettez vos écouteurs. Voyagez sans bouger." |
| Sliders, labels, boutons centrés en bas | Bas de l'écran vide. Disque seul au centre. |
| Aucune respiration | L'anneau pulse avec le son. Flash ambre quand l'ISS change de zone. Point fantôme avec traînée quand muet. |

---

## Ce que j'ai appris

**1. La loi #10 ("Subtract the obvious, add the meaningful") est la seule qui compte vraiment.**
Sans elle, tu vides l'écran jusqu'à ce qu'il n'ait plus d'âme. Avec elle, chaque suppression est compensée par une chose qui *signifie*.

Exemple : retirer le bouton mute = subtract the obvious. Faire du disque lui-même le contrôle = add the meaningful. Une affordance qui dit "la Terre EST le player".

**2. La loi #9 ("Failure") protège du nettoyage compulsif.**
Au bout de la 11ᵉ itération, l'agent m'a dit : *"On touche le plancher. Continuer à retirer viderait le sens."* Et il avait raison. La Loi #9 reconnaît que **certaines choses sont déjà finies** — le piège du designer est de toujours vouloir bouger un curseur.

**3. La loi #5 ("Differences") sauve le minimalisme.**
Un écran *uniformément* minimal devient plat. Il faut **un élément riche** (chez moi : le disque qui respire et flash) pour que le reste lise comme intentionnel et non comme abandonné.

**4. La méthodo "audit-table avant action" change tout.**
Le réflexe agent (et humain) est de redessiner direct. Forcer un tableau *Loi · Gap · Fix* avant de toucher au code :
- Empêche le sur-engineering
- Met l'utilisateur en position de **choix éclairé** (2 sur 5, pas 5 sur 5)
- Rend chaque commit traçable à une intention

**5. K3 "Power" est une loi sous-estimée.**
Pause RAF sur onglet caché. Suspend audio context. Respecter `prefers-reduced-motion`. Ce sont des marques de **respect** de l'utilisateur — sa batterie, son attention. Ça compte.

---

## La citation qui revient

> *"Simplicity is about subtracting the obvious, and adding the meaningful."*
> — John Maeda, *The Laws of Simplicity* (MIT Press, 2006)

Toute la méthodo tient dans cette phrase. Le reste, c'est de la discipline.

---

## Concrètement, dans Claude Code

J'ai utilisé un **skill Markdown** maison (`laws-of-simplicity`) qui charge les 10 lois + 3 clés en contexte de l'agent, avec :
- Un workflow d'audit en 5 étapes
- Une template de réponse en tableau
- Une liste d'erreurs courantes (*"stripping until empty"*, *"ignoring #5 Differences"*, etc.)

L'agent l'invoque automatiquement quand je dis *"simplify"*, *"clean up"* ou *"how can I simplify more?"*.
Coût : zéro nouveau service, juste un fichier.

---

## Ce que ça donne

🌍 **3615 TERRE** : https://mathemagie.github.io/bidouille/3615_terre/

Le repo : https://github.com/mathemagie/mathemagie.github.io

Les 13 derniers commits sur `bidouille/3615_terre/` racontent l'histoire de cette descente :
chaque message commence par *feat:*, *fix:* ou *refactor:*, et chaque diff retire plus de lignes qu'il n'en ajoute.

C'est rare. C'est doux. C'est Maeda.

---

*#design #simplicity #johnmaeda #generativeart #claudecode #webaudio #iss*
