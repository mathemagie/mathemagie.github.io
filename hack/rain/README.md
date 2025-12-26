# Piano de Pluie (Rain Piano) 🌧️🎹

Un projet interactif où des gouttes de pluie tombent du ciel et jouent des notes de piano lorsqu'elles touchent les touches. Vous pouvez également cliquer sur les touches pour jouer des notes manuellement.

## 🎯 Description du Projet

Ce projet combine la visualisation (gouttes de pluie animées) avec l'interactivité (piano jouable) et le son (génération de notes musicales). C'est un excellent exemple d'application web qui utilise le **Web Audio API**, la détection de collision, et les animations CSS.

## ✨ Fonctionnalités

- **Animation de pluie** : Des gouttes de pluie continuent à tomber du haut de l'écran
- **Détection de collision** : Les gouttes détectent quand elles touchent une touche de piano
- **Génération de sons** : Les notes sont générées en temps réel avec le Web Audio API
- **Interaction manuelle** : Vous pouvez cliquer sur les touches pour jouer des notes
- **Effets visuels** : 
  - Les touches s'illuminent quand elles sont activées
  - Des effets de splash apparaissent quand les gouttes touchent les touches
  - Design moderne avec des dégradés

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
Le code vérifie si une goutte de pluie entre en collision avec une touche de piano en comparant leurs positions à l'écran. Cela utilise `getBoundingClientRect()` pour obtenir les coordonnées de chaque élément.

### 3. **Animations CSS**
Les gouttes de pluie tombent grâce à des animations CSS (`@keyframes`). C'est plus performant que de mettre à jour la position avec JavaScript à chaque frame.

### 4. **Manipulation du DOM**
Le projet crée dynamiquement des éléments (gouttes de pluie, effets de splash) et les ajoute/supprime du DOM selon les besoins.

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

## 🎓 Ce Que Vous Apprenez avec Ce Projet

1. **Web Audio API** : Comment générer des sons dans le navigateur
2. **Détection de collision** : Comment détecter quand deux éléments se touchent
3. **Animations CSS** : Comment créer des animations fluides avec CSS
4. **Manipulation du DOM** : Comment créer et supprimer des éléments dynamiquement
5. **Événements** : Comment gérer les clics et autres interactions utilisateur
6. **Intervalles et timeouts** : Comment exécuter du code à intervalles réguliers

## 📝 Notes

- Le projet utilise du JavaScript vanilla (pas de frameworks)
- Compatible avec tous les navigateurs modernes
- Le titre de la page est en français ("Piano de Pluie")
- Les notes musicales sont définies avec leurs fréquences en hertz (Hz)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à proposer des améliorations ou à signaler des bugs.

## 📄 Licence

Ce projet est libre d'utilisation pour l'apprentissage et la pratique.

---

**Amusez-vous bien avec votre piano de pluie !** ☔🎹✨

