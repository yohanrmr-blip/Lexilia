# Lexilia

Application de gestion de dossiers et de facturation pour cabinet d'avocat.

## Fonctionnalités

- **Gestion des clients** : particuliers et entreprises, avec fiche détaillée
- **Gestion des dossiers** : création, suivi de statut, types juridiques (civil, pénal, commercial, famille, etc.)
- **Suivi du temps** : enregistrement des honoraires par dossier (heures × taux)
- **Facturation** : création de factures multi-lignes, TVA configurable, statuts (brouillon → envoyée → payée)
- **Paiements** : enregistrement des paiements par facture, multiples modes (virement, chèque, etc.)
- **Notes** : observations et suivi par dossier
- **Tableau de bord** : CA encaissé, dossiers actifs, factures en attente

## Stack technique

- **Framework** : Next.js 16 (App Router, Server Components)
- **Base de données** : SQLite via Prisma 7 + @prisma/adapter-libsql
- **UI** : Tailwind CSS 4, lucide-react
- **Langage** : TypeScript

## Démarrage

```bash
npm install

# Initialiser la base de données
npx prisma migrate dev

# (Optionnel) Charger des données de démonstration
npx tsx prisma/seed.ts

# Lancer le serveur de développement
npm run dev
```

Ouvrir http://localhost:3000
