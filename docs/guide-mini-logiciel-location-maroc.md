# Mini logiciel de gestion de location de voitures (Maroc) – Excel + VBA léger

Ce guide correspond à ton besoin : **une seule agence (Sefrou)**, **une seule personne**, interface en **français**, dates **jour/mois/année**, devise **DH**, suivi complet (clients, voitures, réservations, départ/retour, prolongation, annulation, paiements, alertes, dashboard).

## 1) Ce que le système gère

- Stockage des voitures (immatriculation, prix/jour, statut).
- Stockage des clients (nom, CIN, téléphone, permis, etc.).
- Réservations avec nombre de jours choisi par le client.
- Gestion du cycle : **Réservation → Départ → Retour → Prolongation → Annulation**.
- Remise paramétrable (%), adaptée aux longues durées ou remises manuelles.
- Suivi des paiements (total payé, reste à payer).
- Suivi entretien (non bloquant).
- Recherche par **CIN, nom client, immatriculation, numéro contrat, date**.
- Dashboard avec KPI + alertes en rouge.

## 2) Fichiers fournis

- `excel-vba/ModuleLocation.bas` : module VBA principal à importer.

## 3) Installation rapide (10 min)

1. Ouvre Excel (Windows).
2. Crée un nouveau classeur `.xlsm`.
3. Active l’onglet **Développeur** (si absent).
4. `ALT + F11` pour ouvrir l’éditeur VBA.
5. `Fichier > Importer un fichier...` puis importe `ModuleLocation.bas`.
6. Retourne dans Excel.
7. `Développeur > Macros` puis lance `InitialiserMiniLogiciel`.

Le classeur crée automatiquement les feuilles suivantes :
- `Parametres`
- `Vehicules`
- `Clients`
- `Reservations`
- `Paiements`
- `Entretien`
- `Dashboard`

## 4) Macros prêtes à l’emploi

### Initialisation
- `InitialiserMiniLogiciel`

### Véhicules
- `AjouterVehicule`
- `ModifierStatutVehicule`

### Clients
- `AjouterClient`

### Réservations
- `NouvelleReservation`
- `MarquerDepart`
- `MarquerRetour`
- `AnnulerReservation`
- `ProlongerReservation`

### Paiements
- `AjouterPaiement`

### Recherche et pilotage
- `RechercheGlobale`
- `RafraichirDashboard`

## 5) Workflow recommandé

1. Ajouter les véhicules.
2. Ajouter les clients.
3. Créer une réservation.
4. Au départ client : `MarquerDepart`.
5. Au retour : `MarquerRetour`.
6. Si besoin : `ProlongerReservation` ou `AnnulerReservation`.
7. Enregistrer les paiements.
8. Lancer `RafraichirDashboard` chaque fin de journée.

## 6) Remises / longues durées

Dans `NouvelleReservation`, tu saisis une remise `%`.
Exemples :
- 0% = pas de remise
- 10% = réduction commerciale
- 20% = offre mensuelle

Tu gardes la flexibilité “soit règle fixe, soit décision manuelle”.

## 7) Alertes en rouge

La macro `RafraichirDashboard` applique un format rouge sur les dates de fin dépassées dans `Reservations` pour signaler les retards/urgences.

## 8) Conseils UX (interface)

Pour une expérience plus efficace :
- Crée une feuille `Accueil` avec gros boutons qui lancent les macros.
- Mets des listes déroulantes pour Statut véhicule et Statut réservation.
- Fige la ligne 1 sur toutes les feuilles.
- Utilise des filtres automatiques sur chaque tableau.

## 9) Évolutions possibles (phase 2)

- UserForms VBA complets (CRUD visuel avec champs).
- Génération automatique de contrat PDF.
- Gestion caution et pénalités de retard.
- Planning calendrier par véhicule.
- Impression “fiche état véhicule départ/retour”.

---

Si tu veux, prochaine étape je peux te préparer la **phase 2 complète avec UserForms graphiques** (vrai mini logiciel visuel dans Excel).
