# 🛰️ ISS Tracker

Un script Python simple pour suivre la position de la Station Spatiale Internationale (ISS) en temps réel et afficher les astronautes actuellement dans l'espace.

## 📋 Description

Ce projet utilise l'API gratuite [Open Notify](http://open-notify.org/) pour récupérer :
- La position actuelle de l'ISS (latitude et longitude)
- La liste des astronautes actuellement dans l'espace
- Un lien Google Maps pour visualiser la position de l'ISS

## 🚀 Prérequis

Avant d'utiliser ce script, vous devez avoir :

1. **Python 3** installé sur votre ordinateur
   - Vérifiez avec : `python3 --version`
   - Si Python n'est pas installé, téléchargez-le sur [python.org](https://www.python.org/)

2. **La bibliothèque `requests`** installée
   - Installez-la avec : `pip3 install requests`
   - Ou : `pip install requests`

## 📦 Installation

1. Clonez ou téléchargez ce projet
2. Ouvrez un terminal dans le dossier du projet
3. Installez les dépendances :
   ```bash
   pip3 install requests
   ```

## 💻 Utilisation

### Exécution simple

```bash
python3 iss_tracker.py
```

### Rendre le script exécutable (optionnel)

Sur Linux/Mac, vous pouvez rendre le script exécutable directement :

```bash
chmod +x iss_tracker.py
./iss_tracker.py
```

## 📊 Exemple de sortie

```
=== ISS Tracker ===

Position actuelle de l'ISS:
  Latitude:  45.1234°
  Longitude: -120.5678°
  Timestamp: 2026-01-28 14:30:45
  Google Maps: https://www.google.com/maps?q=45.1234,-120.5678

Astronautes dans l'espace: 7
  - Nom Astronaute 1 (ISS)
  - Nom Astronaute 2 (ISS)
  ...
```

## 🔧 Fonctionnalités

### `get_iss_position()`
Récupère la position actuelle de l'ISS depuis l'API Open Notify.
- **Retourne** : Un dictionnaire avec la latitude, longitude et timestamp
- **Gère les erreurs** : Affiche un message si la requête échoue

### `get_astronauts_in_space()`
Récupère la liste des astronautes actuellement dans l'espace.
- **Retourne** : Un dictionnaire avec le nombre d'astronautes et leur liste
- **Gère les erreurs** : Affiche un message si la requête échoue

### `main()`
Fonction principale qui orchestre l'affichage des informations.

## 🛠️ Structure du code

```
iss_tracker.py
├── Imports (requests, datetime)
├── get_iss_position()      # Récupère la position de l'ISS
├── get_astronauts_in_space() # Récupère la liste des astronautes
└── main()                    # Point d'entrée du programme
```

## 📚 Concepts utilisés

- **API REST** : Communication avec un service web externe
- **Gestion d'erreurs** : Utilisation de `try/except` pour gérer les problèmes
- **JSON** : Format de données utilisé par l'API
- **Fonctions** : Organisation du code en fonctions réutilisables
- **F-strings** : Formatage moderne des chaînes de caractères en Python

## 🌐 API utilisée

Ce projet utilise l'API gratuite [Open Notify](http://open-notify.org/Open-Notify-API/), qui fournit des données sur l'ISS sans nécessiter de clé API.

- Documentation : http://open-notify.org/Open-Notify-API/
- Endpoint position : `http://api.open-notify.org/iss-now.json`
- Endpoint astronautes : `http://api.open-notify.org/astros.json`

## ⚠️ Gestion des erreurs

Le script gère automatiquement :
- Les problèmes de connexion internet
- Les timeouts (requêtes qui prennent trop de temps)
- Les erreurs de l'API

Si une erreur survient, un message d'erreur sera affiché et le script continuera son exécution.

## 🎓 Pour apprendre

Ce projet est idéal pour apprendre :
- Comment faire des requêtes HTTP en Python
- Comment utiliser des APIs externes
- Comment gérer les erreurs dans un programme
- Comment structurer un projet Python simple

## 🔮 Améliorations possibles

- [ ] Ajouter une boucle pour mettre à jour la position toutes les X secondes
- [ ] Sauvegarder l'historique des positions dans un fichier
- [ ] Créer une visualisation sur une carte du monde
- [ ] Ajouter des arguments en ligne de commande (ex: `--update 5` pour mettre à jour toutes les 5 secondes)
- [ ] Créer une interface graphique avec tkinter

## 📝 Licence

Ce projet est libre d'utilisation pour l'apprentissage.

## 🤝 Contribution

N'hésitez pas à améliorer ce projet ! C'est un excellent moyen d'apprendre en pratiquant.

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que Python 3 est installé
2. Vérifiez que `requests` est installé : `pip3 list | grep requests`
3. Vérifiez votre connexion internet
4. Consultez la documentation de l'API : http://open-notify.org/

---

**Bon codage ! 🚀**
