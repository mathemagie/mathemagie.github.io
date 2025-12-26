# Piano de Pluie (Rain Piano) 🌧️🎹

Un projet interactif où des gouttes de pluie tombent du ciel et jouent des notes de piano lorsqu'elles touchent les touches. Vous pouvez également cliquer sur les touches pour jouer des notes manuellement.

## 🎯 Description du Projet

Ce projet combine la visualisation (gouttes de pluie animées) avec l'interactivité (piano jouable) et le son (génération de notes musicales). C'est un excellent exemple d'application web qui utilise le **Web Audio API**, la détection de collision, et les animations CSS.

## ✨ Fonctionnalités

- **Animation de pluie** : Des gouttes de pluie continuent à tomber du haut de l'écran
- **Système de physique** : Les gouttes ont une physique réaliste avec gravité, vélocité et rebonds
- **Déflecteurs interactifs** : Créez des rectangles déflecteurs pour rediriger les gouttes de pluie
  - **Créer** : Cliquez n'importe où au-dessus du piano pour créer un déflecteur
  - **Tourner** : Faites glisser un déflecteur pour le faire tourner
  - **Déplacer** : Maintenez Shift et faites glisser pour déplacer un déflecteur
  - **Redimensionner** : Faites glisser les bords gauche ou droit pour ajuster la largeur
  - **Supprimer** : Clic droit sur un déflecteur et sélectionnez "Supprimer"
- **Rebonds physiques** : Les gouttes rebondissent sur les déflecteurs jusqu'à 5 fois avec un système de réflexion réaliste
- **Détection de collision** : Les gouttes détectent quand elles touchent une touche de piano ou un déflecteur
- **Génération de sons** : Les notes sont générées en temps réel avec le Web Audio API
- **Interaction manuelle** : Vous pouvez cliquer sur les touches pour jouer des notes
- **Effets visuels** : 
  - Les touches s'illuminent quand elles sont activées
  - Des effets de splash apparaissent quand les gouttes touchent les touches
  - Les déflecteurs s'illuminent quand ils sont touchés par une goutte
  - Design moderne avec des dégradés et des ombres

## 🚀 Installation et Utilisation

### Prérequis
Aucun ! Ce projet utilise uniquement HTML, CSS et JavaScript pur - pas besoin d'installer quoi que ce soit.

### Pour lancer le projet

1. Téléchargez ou clonez ce projet
2. Ouvrez le fichier `index.html` dans votre navigateur web
   - Vous pouvez simplement double-cliquer sur le fichier
   - Ou utiliser un serveur local (par exemple, avec Python : `python -m http.server`)

3. Profitez de la musique générée par la pluie ! ☔🎵

## 📁 Structure du Projet

```
rain/
├── index.html      # Structure HTML de la page
├── script.js       # Logique JavaScript (animation, collision, audio)
├── style.css       # Styles CSS (apparence, animations)
└── README.md       # Ce fichier
```

## 🔧 Concepts Techniques Utilisés

### 1. **Web Audio API**
Le Web Audio API permet de générer des sons directement dans le navigateur. Dans ce projet, nous utilisons :
- `AudioContext` : Le contexte audio principal
- `Oscillator` : Génère des ondes sinusoïdales pour créer les notes
- `GainNode` : Contrôle le volume du son

**Exemple de code** :
```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 440; // La note A4
oscillator.type = 'sine';
```

### 2. **Détection de Collision**
Le code vérifie si une goutte de pluie entre en collision avec une touche de piano ou un déflecteur en comparant leurs positions à l'écran. Cela utilise `getBoundingClientRect()` pour obtenir les coordonnées de chaque élément. Pour les déflecteurs rotatifs, le code transforme les coordonnées dans le système local du rectangle pour détecter les collisions avec précision.

### 2.5. **Système de Physique**
Le projet implémente un moteur de physique simple mais efficace :
- **Gravité** : Les gouttes accélèrent vers le bas (980 pixels/seconde²)
- **Vélocité** : Chaque goutte a une vélocité X et Y qui change lors des rebonds
- **Rebonds** : Calcul de réflexion vectorielle avec amortissement (damping factor de 0.9)
- **Limite de rebonds** : Les gouttes peuvent rebondir jusqu'à 5 fois avant de tomber normalement
- **Cooldown** : Système de cooldown pour éviter les collisions multiples avec le même déflecteur

### 3. **Animations CSS et JavaScript**
- **Animations CSS** : Les nouvelles gouttes utilisent des animations CSS (`@keyframes`) pour tomber, ce qui est plus performant
- **Physique JavaScript** : Après avoir touché un déflecteur, les gouttes passent à un système de physique JavaScript utilisant `requestAnimationFrame` pour des mouvements fluides et réalistes
- **Transitions CSS** : Les effets visuels (illumination des touches, flash des déflecteurs) utilisent des transitions CSS pour des animations fluides

### 4. **Manipulation du DOM**
Le projet crée dynamiquement des éléments (gouttes de pluie, déflecteurs, effets de splash) et les ajoute/supprime du DOM selon les besoins. Les déflecteurs peuvent être manipulés en temps réel (rotation, déplacement, redimensionnement) avec des événements de souris.

### 5. **Gestion des Événements**
Le projet gère plusieurs types d'événements :
- **Clics** : Pour créer des déflecteurs et jouer des notes
- **Glisser-déposer** : Pour manipuler les déflecteurs (rotation, déplacement)
- **Clic droit** : Pour afficher le menu contextuel et supprimer des déflecteurs
- **Touches clavier** : Shift pour basculer entre rotation et déplacement

## 🎼 Notes Musicales

Le piano couvre 3 octaves (C4 à C6) avec toutes les notes naturelles et dièses. Les fréquences utilisées sont basées sur le standard musical international (A4 = 440 Hz).

## 💡 Idées d'Amélioration

Si vous voulez aller plus loin avec ce projet, voici quelques idées :

- **Contrôle de la vitesse de la pluie** : Ajouter un slider pour changer la fréquence des gouttes
- **Changer les types d'ondes** : Essayer différents types d'oscillateurs (square, sawtooth, triangle)
- **Enregistrer la musique** : Permettre d'enregistrer les séquences musicales créées
- **Mode de jeu** : Créer un mode où vous devez jouer certaines notes
- **Thèmes visuels** : Ajouter plusieurs thèmes de couleurs
- **Plus de touches** : Étendre le piano à plus d'octaves
- **Formes de déflecteurs** : Ajouter d'autres formes (cercles, triangles) en plus des rectangles
- **Paramètres de physique** : Permettre d'ajuster la gravité, l'amortissement, et le nombre de rebonds
- **Sauvegarde de configurations** : Sauvegarder et charger des configurations de déflecteurs
- **Particules** : Ajouter des effets de particules lors des collisions

## 🎓 Ce Que Vous Apprenez avec Ce Projet

1. **Web Audio API** : Comment générer des sons dans le navigateur
2. **Détection de collision** : Comment détecter quand deux éléments se touchent, y compris avec des rotations
3. **Physique de base** : Implémentation d'un moteur de physique simple (gravité, vélocité, rebonds)
4. **Mathématiques vectorielles** : Calcul de réflexion vectorielle pour les rebonds réalistes
5. **Transformations géométriques** : Conversion entre systèmes de coordonnées (global vs local) pour les objets rotatifs
6. **Animations CSS et JavaScript** : Combinaison d'animations CSS performantes et de physique JavaScript
7. **Manipulation du DOM** : Comment créer et supprimer des éléments dynamiquement
8. **Gestion d'événements avancée** : Gestion de multiples types d'interactions (clic, glisser, clic droit, touches clavier)
9. **Intervalles et requestAnimationFrame** : Utilisation de `setInterval` et `requestAnimationFrame` pour des animations fluides
10. **Menu contextuel** : Création d'un menu contextuel personnalisé

## 📝 Notes

- Le projet utilise du JavaScript vanilla (pas de frameworks)
- Compatible avec tous les navigateurs modernes
- Le titre de la page est en français ("Piano de Pluie")
- Les notes musicales sont définies avec leurs fréquences en hertz (Hz)
- Les déflecteurs utilisent un système de coordonnées locales pour gérer les rotations
- Le système de physique utilise un pas de temps variable avec limitation pour éviter les problèmes de performance
- Les gouttes passent d'un système d'animation CSS à un système de physique JavaScript après le premier rebond

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à proposer des améliorations ou à signaler des bugs.

## 📄 Licence

Ce projet est libre d'utilisation pour l'apprentissage et la pratique.

---

**Amusez-vous bien avec votre piano de pluie !** ☔🎹✨


