# Mes Histoires Magiques : quand mon fils de 7 ans devient développeur

**Ou comment un rituel du soir s'est transformé en projet de coding père-fils**

---

## Le problème du soir

Chaque soir, c'est le même rituel. Après le bain, le pyjama et le brossage de dents (plus ou moins négocié), vient le moment sacré : **l'histoire**.

Comme beaucoup de parents, j'ai découvert les podcasts de France Inter pour enfants. "Une histoire et... Oli!", "Les Odyssées", "Les Explorateurs de l'Univers"... Des trésors audio racontés par des voix merveilleuses. Mais voilà : naviguer sur le site de Radio France avec un enfant de 7 ans qui s'impatiente, c'est un peu comme essayer de commander au restaurant avec un chat sur les genoux. Possible, mais épuisant.

"Papa, c'est quand qu'on écoute l'histoire ?"
"Attends, je cherche..."
"Mais papa, tu cherches TOUJOURS !"

Il n'avait pas tort.

---

## La solution : coder ensemble

Un samedi matin, j'ai eu une idée. Et si on créait notre propre application d'histoires ? Pas "je" — **on**. Mon fils et moi.

Lui me regardait, les yeux brillants : "C'est quoi une application ?"

Bonne question. Trois heures et deux chocolats chauds plus tard, **Mes Histoires Magiques** était née.

---

## Ce que fait l'application

C'est simple : notre app rassemble automatiquement les podcasts pour enfants de France Inter dans une interface pensée pour... les enfants. Et par "pensée pour les enfants", je veux dire : pensée **avec** un enfant.

### Les catégories (choix du chef, 7 ans)

Mon fils a insisté pour avoir des filtres. "Pour trouver les histoires avec des animaux, papa !" Il a choisi lui-même les catégories :

- 🌟 **Toutes** (parce qu'on veut tout, toujours)
- ✨ **Magique** (évidemment)
- 🐾 **Animaux** (son préféré)
- 🗺️ **Aventure** (pour les soirs où on a de l'énergie)
- 🤝 **Amitié** (les histoires qui font chaud au cœur)
- 👨‍👩‍👧 **Famille** (oui, il a choisi cet emoji lui-même)
- 🌿 **Nature** (pour les histoires calmes)

Les emojis ? Entièrement son choix. On a passé une demi-heure à débattre entre 🐾 et 🐕 pour "Animaux". La patte a gagné car "c'est pour TOUS les animaux, papa, pas juste les chiens".

### Le design "nuit étoilée"

L'écran principal ressemble à un ciel nocturne avec des étoiles qui scintillent, des nuages qui passent doucement, et une lune. Parce que les histoires, ça s'écoute le soir, et le soir il y a des étoiles. CQFD (logique imparable d'un enfant de 7 ans).

### Le vinyle magique

Le lecteur audio affiche un disque vinyle qui tourne quand l'histoire joue. Mon fils n'a jamais vu un vrai vinyle de sa vie, mais il trouve ça "trop stylé". Allez comprendre.

### La surprise

Les histoires sont mélangées aléatoirement. "Comme ça, on sait jamais laquelle va arriver, c'est plus rigolo !" m'a-t-il expliqué. Techniquement, c'est un algorithme de Fisher-Yates. Pour lui, c'est de la magie.

---

## Comment ça marche (version simple)

Pour les curieux, voici ce qui se passe sous le capot :

1. **Un script Python** va chercher automatiquement les nouveaux épisodes sur les flux RSS de Radio France
2. Il extrait les fichiers audio et les classe par thématique
3. Les fichiers sont stockés sur **Amazon S3** (le cloud, quoi)
4. L'application web (une **PWA**) affiche tout ça joliment
5. On peut même l'installer sur le téléphone comme une vraie app

Le tout tient en quelques fichiers. Pas de magie noire, juste du code écrit avec amour (et parfois avec un enfant qui demande "c'est fini ?" toutes les 5 minutes).

---

## Ce qu'on a appris

### Lui :
- Que les applications "c'est des gens qui les font"
- Que les emojis, c'est sérieux
- Que papa galère parfois devant l'ordinateur (ça l'a beaucoup amusé)

### Moi :
- Qu'un enfant de 7 ans est un excellent product manager
- Que le design doit être simple ou il ne sert à rien
- Que coder avec son fils, c'est lent, chaotique, et absolument merveilleux

---

## Le résultat

Aujourd'hui, notre rituel du soir est plus simple. On ouvre l'app, on choisit une catégorie (souvent 🐾), on appuie sur "Suivant", et la magie opère.

Plus de navigation laborieuse, plus de "papa tu cherches toujours". Juste une histoire, des étoiles qui brillent sur l'écran, et un enfant qui s'endort en souriant.

Est-ce que le code est parfait ? Non.
Est-ce que l'app va révolutionner le monde ? Probablement pas.
Est-ce que mon fils est fier de "son" application ? **Absolument**.

Et franchement, c'est tout ce qui compte.

---

*Mes Histoires Magiques est disponible sur [mathemagie.github.io/audio](https://mathemagie.github.io/audio). Le code source est open source pour les parents-développeurs qui voudraient s'en inspirer.*

---

**Et vous, c'est quoi votre rituel du soir avec vos enfants ?**
