import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("./dev.db");

function id() {
  return randomUUID().replace(/-/g, "").substring(0, 25);
}

const now = new Date().toISOString();

db.prepare("DELETE FROM Paiement").run();
db.prepare("DELETE FROM LigneFacture").run();
db.prepare("DELETE FROM Facture").run();
db.prepare("DELETE FROM Honoraire").run();
db.prepare("DELETE FROM Note").run();
db.prepare("DELETE FROM Dossier").run();
db.prepare("DELETE FROM Client").run();

const client1Id = id();
db.prepare(`
  INSERT INTO Client (id, nom, prenom, email, telephone, adresse, type, societe, siret, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(client1Id, "Dupont", "Jean", "jean.dupont@email.fr", "06 12 34 56 78", "12 rue de la Paix\n75001 Paris", "particulier", null, null, now, now);

const client2Id = id();
db.prepare(`
  INSERT INTO Client (id, nom, prenom, email, telephone, adresse, type, societe, siret, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(client2Id, "Martin", "Sophie", "s.martin@techcorp.fr", "01 23 45 67 89", "5 avenue des Champs-Élysées\n75008 Paris", "entreprise", "TechCorp SAS", "12345678901234", now, now);

const dossier1Id = id();
db.prepare(`
  INSERT INTO Dossier (id, reference, titre, description, statut, type, dateOuverture, clientId, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(dossier1Id, "DOS-2026-0001", "Litige commercial - Contrat de prestation",
  "Litige relatif à un contrat de prestation de services non exécuté.",
  "en_cours", "commercial", now, client2Id, now, now);

const dossier2Id = id();
db.prepare(`
  INSERT INTO Dossier (id, reference, titre, description, statut, type, dateOuverture, clientId, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(dossier2Id, "DOS-2026-0002", "Divorce - Procédure amiable", null, "ouvert", "famille", now, client1Id, now, now);

db.prepare(`
  INSERT INTO Honoraire (id, date, description, heures, tauxHoraire, montant, dossierId, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(id(), "2026-04-01T00:00:00.000Z", "Consultation initiale et analyse du dossier", 2, 250, 500, dossier1Id, now);

db.prepare(`
  INSERT INTO Honoraire (id, date, description, heures, tauxHoraire, montant, dossierId, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(id(), "2026-04-10T00:00:00.000Z", "Rédaction de conclusions", 4, 250, 1000, dossier1Id, now);

const facture1Id = id();
db.prepare(`
  INSERT INTO Facture (id, numero, dateEmission, dateEcheance, montantHT, tva, montantTTC, statut, dossierId, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(facture1Id, "FAC-2026-0001", now, "2026-05-19T00:00:00.000Z", 1500, 20, 1800, "envoyee", dossier1Id, now, now);

db.prepare(`INSERT INTO LigneFacture (id, description, quantite, prixUnitaire, montant, factureId) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(id(), "Consultation et analyse du dossier", 2, 250, 500, facture1Id);
db.prepare(`INSERT INTO LigneFacture (id, description, quantite, prixUnitaire, montant, factureId) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(id(), "Rédaction de conclusions", 4, 250, 1000, facture1Id);

const facture2Id = id();
db.prepare(`
  INSERT INTO Facture (id, numero, dateEmission, dateEcheance, montantHT, tva, montantTTC, statut, dossierId, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(facture2Id, "FAC-2026-0002", now, "2026-06-01T00:00:00.000Z", 600, 20, 720, "brouillon", dossier2Id, now, now);

db.prepare(`INSERT INTO LigneFacture (id, description, quantite, prixUnitaire, montant, factureId) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(id(), "Consultation initiale divorce", 2, 250, 500, facture2Id);
db.prepare(`INSERT INTO LigneFacture (id, description, quantite, prixUnitaire, montant, factureId) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(id(), "Frais de dossier", 1, 100, 100, facture2Id);

db.prepare(`INSERT INTO Note (id, contenu, dossierId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`)
  .run(id(), "Client contacté. En attente des pièces justificatives du contrat.", dossier1Id, now, now);

const counts = {
  clients: (db.prepare("SELECT COUNT(*) as n FROM Client").get() as { n: number }).n,
  dossiers: (db.prepare("SELECT COUNT(*) as n FROM Dossier").get() as { n: number }).n,
  factures: (db.prepare("SELECT COUNT(*) as n FROM Facture").get() as { n: number }).n,
};

console.log("✓ Base de données initialisée avec des données de démonstration");
console.log(`  - ${counts.clients} clients`);
console.log(`  - ${counts.dossiers} dossiers`);
console.log(`  - ${counts.factures} factures`);

db.close();
