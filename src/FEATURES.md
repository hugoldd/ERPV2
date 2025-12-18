# Fonctionnalités du tableau de bord ERP

Ce tableau de bord ERP pour chef de projet dispose de nombreuses fonctionnalités interactives organisées en plusieurs sections navigables.

## Navigation principale

### Pages disponibles
1. **Portefeuille projets** - Tableau de bord personnalisable avec widgets
2. **Planning** - Vue d'ensemble des interventions planifiées
3. **Ressources** - Gestion des consultants et de leurs disponibilités
4. **Articles** - Catalogue des prestations vendues
5. **Reporting** - Analyses et indicateurs de performance
6. **Administration** - Configuration des projets packagés et séquençage

## 1. Portefeuille projets (Dashboard)

### Personnalisation du tableau de bord
- **Bouton "Personnaliser le tableau de bord"** :
  - Activation/désactivation de chaque widget
  - Réorganisation par glisser-déposer
  - Configuration sauvegardée en temps réel
  - 8 widgets disponibles

### Widget Résumé projet
- **Voir le projet complet** : Vue détaillée avec informations budgétaires
- **Suggérer ressources** : Modal intelligente proposant :
  - Consultants disponibles sur la période
  - Matching par compétences requises
  - Score de compatibilité (%)
  - Disponibilité en temps réel
  - Affectation multiple au projet
- **Générer planning** : Génération automatique avec :
  - Planning séquencé des prestations
  - Affectation des consultants
  - Modes d'intervention (sur site/à distance)
  - Dates et durées calculées
  - Export PDF et Excel

### Autres widgets
- **Consommation par prestation** : Détails par service
- **Prérequis client** : Gestion des livrables attendus
- **Interventions à venir** : Planning des interventions
- **Validations client** : Suivi des validations et relances
- **Écarts de charge** : Alertes de dépassement
- **Jalons clés** : MOM, VA, VSR
- **Documents récents** : Visualisation et téléchargement

## 2. Ressources

### Vue Liste (Table)
- **Liste complète des consultants** avec :
  - Photo de profil et nom
  - Service d'appartenance
  - Compétences (badges cliquables)
  - Localisation géographique (ville)
  - Contact (email, téléphone cliquables)
  - Barre de disponibilité en %
- **Filtres avancés** :
  - Recherche par nom ou email
  - Filtre par compétence
  - Filtre par localisation

### Vue Planning (Calendrier)
- **Planning de disponibilité sur 2 semaines** :
  - Vue calendrier par consultant
  - Affichage des réservations (projets)
  - Visualisation des jours libres
  - Navigation semaine par semaine
  - Légende (disponible/réservé)

### Gestion des consultants
- **Ajouter un consultant** :
  - Nom complet
  - Email et téléphone
  - Service et localisation
  - Compétences multiples
  - Disponibilité (slider 0-100%)

## 3. Articles

### Catalogue des prestations
- **Vue en grille des articles** :
  - Nom de l'article
  - Type de prestation (Installation, Paramétrage, Formation, etc.)
  - Service propriétaire
  - Compétences nécessaires
  - Durée standard en jours
  - Mode d'intervention (Sur site/À distance/Hybride)
  - Description

### Gestion des articles
- **Créer un article** :
  - Formulaire complet
  - Sélection multiple de compétences
  - Configuration du mode d'intervention
- **Modifier/Supprimer** : Actions sur chaque article
- **Recherche** : Filtrage en temps réel

## 4. Administration

### Onglet "Projets packagés"
- **Modèles de projet réutilisables** :
  - Nom et description du modèle
  - Type (Packagé/Sur-mesure)
  - Articles inclus
  - Durée estimée (calendaire)
  - Jours vendus
- **Gestion des modèles** :
  - Création de nouveaux modèles
  - Modification des modèles existants
  - Suppression de modèles

### Onglet "Séquençage des prestations"
- **Configuration du workflow** :
  - Ordre des prestations
  - Définition des dépendances
  - Représentation visuelle avec flèches
  - Ajout/suppression d'étapes
- **Usage** : Utilisé pour la génération automatique de planning

### Onglet "Paramètres généraux"
- Configuration des notifications
- Préférences d'affichage
- Langue et fuseau horaire

## 5. Fonctionnalités transverses

### Création de projet (TopBar)
- **Bouton "Créer un projet"** :
  - Nom du client
  - Type (Packagé/Sur-mesure)
  - Jours vendus
  - Dates de début et fin
  - Chef de projet
  - Description
  - Notification de succès

### Système de notifications
- Toast de succès/erreur
- Animations fluides
- Fermeture automatique (5s)
- Fermeture manuelle possible

### Filtres contextuels
- Sélecteur de projet
- Type de projet (Packagé/Sur-mesure)
- Période (Cette semaine/30j/90j)

## 6. Suggestion intelligente de ressources

### Critères de matching
- Compétences requises vs compétences du consultant
- Disponibilité sur la période du projet
- Service d'appartenance
- Localisation (pour interventions sur site)

### Score de compatibilité
- 90-100% : Excellent match (vert)
- 75-89% : Bon match (bleu)
- 60-74% : Match acceptable (orange)
- < 60% : Match faible (gris)

## 7. Génération automatique de planning

### Algorithme
1. Récupération du séquençage configuré
2. Analyse des dépendances entre prestations
3. Affectation des consultants selon disponibilités
4. Calcul des dates selon durées standard
5. Génération du tableau récapitulatif

### Exports disponibles
- PDF : Planning visuel imprimable
- Excel : Données éditables pour ajustements

## Design & UX

### Principes
- Interface B2B SaaS professionnelle
- Thème clair avec beaucoup d'espace blanc
- Couleur primaire : bleu désaturé
- Badges colorés pour statuts
- Responsive design
- Navigation fluide entre sections

### Accessibilité
- Tous les textes en français
- Icônes explicites (Lucide React)
- États hover et focus clairs
- Messages de confirmation
- Retours visuels instantanés

## Technologies utilisées
- React avec TypeScript
- Tailwind CSS v4.0
- Lucide React (icônes)
- Drag & drop natif
- Modals réutilisables
