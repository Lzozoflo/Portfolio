// ─────────────────────────────────────────────────────────────────────────────
// packages/shared/src/index.ts
// Types partagés front ↔ back (et entre composants frontend)
// ─────────────────────────────────────────────────────────────────────────────

// ─── FileNode ─────────────────────────────────────────────────────────────────
//
// Type "vue" — représente un nœud dans l'arbre en MÉMOIRE.
// C'est ce que les composants graphiques consomment (Explorateur, ExplorateurItem).
//
// ⚠️ Ce type est volontairement simple / récursif : il est facile à afficher
//    dans un arbre React, mais inefficace pour le terminal (parcours O(n) pour
//    chaque commande). C'est pour ça qu'on ne stocke PAS ce type dans IDB.
//
export type FileNode = {
    name: string;                    // "ReadMe.md" ou "user/"
    type: 'file' | 'folder';
    children?: FileNode[];           // sous-noeuds (si type === "folder")
};

// ─── IDBNode ──────────────────────────────────────────────────────────────────
//
// Type "stockage" — représente un nœud PLAT dans IndexedDB.
// Chaque nœud est une entrée indépendante, indexée par son chemin absolu.
//
// Pourquoi plat et non arbre JSON ?
//
//   Scénario 1 — Terminal : `cat /user/ReadMe.md`
//     → Arbre   : parcourir tout le JSON jusqu'à trouver le nœud  → O(n)
//     → IDB     : db.get('filesystem', '/user/ReadMe.md')          → O(1)  ✓
//
//   Scénario 2 — Terminal : `ls /user/`
//     → Arbre   : parcourir jusqu'au dossier /user/, lister ses enfants → O(n)
//     → IDB     : db.getAllFromIndex('by_parent', '/user/')              → O(1)  ✓
//
//   Scénario 3 — Terminal : `mkdir /user/nouveau/`
//     → Arbre   : reconstruire + re-sérialiser tout le JSON → O(n) + coûteux
//     → IDB     : db.put({ path: '/user/nouveau/', ... })   → O(1)  ✓
//
//   Scénario 4 — Mode graphique : afficher l'arbre
//     → IDB     : getAllNodes() → reconstruction O(n) UNE SEULE FOIS au mount ✓
//
export type IDBNode = {
    // ── Identité ──────────────────────────────────────────────────────────
    path: string;           // CLEF PRIMAIRE. Chemin absolu complet.
                            // ex: "/user/Experience pro/"
                            // ex: "/user/ReadMe.md"
                            // ex: "/"  (racine)

    name: string;           // Nom seul (sans le chemin parent).
                            // ex: "Experience pro/"
                            // ex: "ReadMe.md"
                            // Note : les dossiers ont un "/" de fin par convention.

    type: 'file' | 'folder';

    // ── Contenu ───────────────────────────────────────────────────────────
    data?: string;          // Contenu texte. Uniquement si type === "file".
                            // undefined pour les dossiers.

    // ── Navigation ────────────────────────────────────────────────────────
    parentPath: string;     // Chemin du dossier parent.
                            // ex: "/user/" pour "/user/ReadMe.md"
                            // ex: "/"      pour "/user/"
                            // ex: ""       pour "/" (la racine n'a pas de parent)
                            //
                            // C'est sur ce champ qu'on crée l'INDEX IDB,
                            // ce qui permet ls() en O(1) :
                            //   db.getAllFromIndex('by_parent', '/user/')

    // ── Métadonnées ───────────────────────────────────────────────────────
    createdAt: number;      // Date.now() — timestamp en ms
    updatedAt: number;      // Date.now() — mis à jour à chaque write()
};
