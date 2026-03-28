// ─────────────────────────────────────────────────────────────────────────────
// apps/frontend/src/hooks/useFilesystem.tsx
//
// Hook principal du système de fichiers virtuel.
//
// RESPONSABILITÉS :
//   1. Ouvrir / créer la base IndexedDB au montage
//   2. Seeder les données initiales si la base est vide (1er chargement)
//   3. Exposer un arbre FileNode[] reconstruit pour le mode graphique
//   4. Exposer des opérations CRUD pour le terminal (ls, cat, mkdir, touch, write, rm)
//
// ARCHITECTURE :
//   IDBNode (stockage plat) ←→ FileNode (arbre en mémoire)
//      ↑                              ↑
//   IndexedDB                    Composants React
//   (persistant)                 (Explorateur, terminal)
//
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import type { IDBNode, FileNode } from '@portfolio/shared';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const DB_NAME = 'portfolio-fs';   // Nom de la base IDB (visible dans DevTools → Application → IndexedDB)
const DB_VERSION = 1;             // Version du schéma. Incrémenter quand on modifie le schéma IDB.
const STORE_NAME = 'filesystem';  // Nom de l'ObjectStore (≈ table SQL)
const INDEX_PARENT = 'by_parent'; // Nom de l'index sur parentPath (permet ls() en O(1))

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — DONNÉES INITIALES
//
// Structure arborescente "source de vérité" pour le seed.
// → Converti en IDBNode[] plat au 1er chargement uniquement.
// → Après ça, IDB est la vraie source (cette const n'est plus utilisée).
// ─────────────────────────────────────────────────────────────────────────────

const INIT_FILESYSTEM: FileNode[] = [
    {
        name: '/',
        type: 'folder',
        children: [
            {
                name: 'user/',
                type: 'folder',
                children: [
                    {
                        name: 'ReadMe.md',
                        type: 'file',
                        data: '# Bienvenue\n\nCeci est le filesystem virtuel du portfolio.\n\nMode inviter : explorateur graphique\nMode admin   : terminal bash-like'
                    },
                    {
                        name: 'Experience pro/',
                        type: 'folder',
                        children: [
                            { name: 'overview.md', type: 'file', data: '# Expérience professionnelle\n\nÀ compléter...' }
                        ]
                    },
                    {
                        name: 'Tech/',
                        type: 'folder',
                        children: [
                            { name: 'stack.md', type: 'file', data: '# Stack technique\n\nTypeScript, React, Node.js, PostgreSQL, Docker...' }
                        ]
                    },
                    {
                        name: 'Tool/',
                        type: 'folder',
                        children: [
                            { name: 'tools.md', type: 'file', data: '# Outils\n\nGit, Docker, VSCode, Zsh...' }
                        ]
                    },
                    {
                        name: 'Sandbox/',
                        type: 'folder',
                        children: [
                            { name: 'ReadMe.md', type: 'file', data: 'Zone libre — tu peux créer des fichiers ici.\n\nMode inviter : clic droit\nMode admin   : touch / mkdir' },
                        ]
                    }
                ]
            }
        ]
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — CONVERSION ARBRE ↔ PLAT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * flattenTree — Convertit un arbre FileNode[] en tableau plat IDBNode[]
 *
 * Exemple d'appel :
 *   flattenTree(INIT_FILESYSTEM, "")
 *
 * Résultat :
 *   [
 *     { path: "/",                name: "/",          parentPath: ""        },
 *     { path: "/user/",           name: "user/",      parentPath: "/"       },
 *     { path: "/user/ReadMe.md",  name: "ReadMe.md",  parentPath: "/user/"  },
 *     ...
 *   ]
 *
 * Convention de chemin :
 *   - parentPath === ""  → le nœud est la racine (pas de parent)
 *   - Les dossiers ont un "/" de fin dans leur name ET leur path
 *   - Les fichiers n'ont pas de "/" de fin
 *
 * @param nodes       tableau de nœuds à aplatir (les enfants du niveau courant)
 * @param parentPath  chemin absolu du dossier parent ("" pour la racine)
 */
function flattenTree(nodes: FileNode[], parentPath: string): IDBNode[] {
    const result: IDBNode[] = [];
    const now = Date.now();

    for (const node of nodes) {
        // Construction du chemin absolu :
        //
        //   parentPath = ""   + name = "/"        → path = "/"
        //   parentPath = "/"  + name = "user/"    → path = "/user/"
        //   parentPath = "/user/" + name = "ReadMe.md" → path = "/user/ReadMe.md"
        //
        // Cas spécial : si parentPath est vide (racine), le path est juste le name.
        // Sinon, on concatène directement (pas de "/" intermédiaire car parentPath
        // se termine déjà par "/" pour les dossiers).
        const path = parentPath === '' ? node.name : parentPath + node.name;

        result.push({
            path,
            name: node.name,
            type: node.type,
            data: node.data,
            parentPath,
            createdAt: now,
            updatedAt: now
        });

        // Récursion sur les enfants si c'est un dossier non vide.
        // Le parentPath des enfants = path du nœud courant.
        if (node.type === 'folder' && node.children && node.children.length > 0) {
            result.push(...flattenTree(node.children, path));
        }
    }

    return result;
}

/**
 * buildTree — Reconstruit un arbre FileNode[] depuis un tableau plat IDBNode[]
 *
 * Utilisé par le mode graphique après chaque opération CRUD.
 * Complexité O(n) — deux passes sur le tableau :
 *   1. Créer un Map path → FileNode
 *   2. Relier chaque nœud à son parent
 *
 * @param nodes  tous les nœuds IDB (résultat de getAllNodes)
 * @returns      tableau des nœuds racine (parentPath === "")
 */
function buildTree(nodes: IDBNode[]): FileNode[] {
    // Passe 1 — on construit un Map pour l'accès O(1) par path.
    //
    // On initialise children à [] pour les dossiers dès maintenant,
    // pour pouvoir pousser dedans en passe 2 sans vérification.
    const map = new Map<string, FileNode>();

    for (const n of nodes) {
        map.set(n.path, {
            name: n.name,
            type: n.type,
            data: n.data,
            // Un fichier n'a pas de children (undefined).
            // Un dossier commence avec un tableau vide.
            children: n.type === 'folder' ? [] : undefined
        });
    }

    // Passe 2 — on relie chaque nœud à son parent.
    const roots: FileNode[] = [];

    for (const n of nodes) {
        const node = map.get(n.path)!; // Garanti présent (on vient de set)

        if (n.parentPath === '') {
            // Pas de parent → c'est un nœud racine (ex: "/")
            roots.push(node);
        } else {
            // A un parent → on le pousse dans children du parent.
            const parent = map.get(n.parentPath);
            if (parent?.children) {
                parent.children.push(node);
            }
            // Si parent introuvable : nœud orphelin (cas anormal), on ignore.
        }
    }

    return roots;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — WRAPPERS IDB (promesses)
//
// L'API IndexedDB native est entièrement basée sur des CALLBACKS et des
// "request" objects. C'est verbeux et difficile à utiliser avec async/await.
//
// On encapsule chaque opération dans une Promise propre.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * openDb — Ouvre (ou crée) la base IndexedDB.
 *
 * onupgradeneeded : appelé automatiquement par le navigateur lors de :
 *   - La toute première ouverture (création de la base)
 *   - Une augmentation de DB_VERSION (migration de schéma)
 *
 * Dans ce callback, on crée l'ObjectStore et l'index si nécessaire.
 * C'est le seul endroit où on peut modifier la structure de la base.
 */
function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Création / migration du schéma
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Guard : ne crée le store que s'il n'existe pas déjà
            // (sécurité en cas de re-run de la migration)
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // ObjectStore = "table" IDB.
                // keyPath: 'path' → la propriété "path" de chaque objet est la clé primaire.
                // Pas besoin d'autoIncrement : on gère les clés manuellement.
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'path' });

                // Index sur parentPath.
                // unique: false → plusieurs nœuds peuvent avoir le même parentPath
                //                 (un dossier peut avoir plusieurs enfants).
                // Cet index est ce qui rend ls() en O(1) :
                //   store.index('by_parent').getAll('/user/')
                store.createIndex(INDEX_PARENT, 'parentPath', { unique: false });
            }
        };

        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
        request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
}

/**
 * getAllNodes — Récupère TOUS les nœuds du filesystem.
 * Utilisé pour rebuilder l'arbre en mémoire après chaque opération.
 */
function getAllNodes(db: IDBDatabase): Promise<IDBNode[]> {
    return new Promise((resolve, reject) => {
        // Une "transaction" IDB est obligatoire pour toute opération.
        // 'readonly' = lecture seule (plus performant, pas de lock exclusif).
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll(); // Récupère toutes les entrées

        request.onsuccess = () => resolve(request.result as IDBNode[]);
        request.onerror = () => reject(request.error);
    });
}

/**
 * getNode — Récupère un nœud par son path exact.
 * Utilisé par cat() et write().
 */
function getNode(db: IDBDatabase, path: string): Promise<IDBNode | undefined> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(path); // Recherche par clé primaire → O(1)

        request.onsuccess = () => resolve(request.result as IDBNode | undefined);
        request.onerror = () => reject(request.error);
    });
}

/**
 * getByParent — Récupère tous les enfants directs d'un dossier.
 * Utilisé par ls().
 *
 * IDBKeyRange.only(folderPath) = filtre exact sur l'index.
 * Résultat : tous les nœuds dont parentPath === folderPath.
 */
function getByParent(db: IDBDatabase, folderPath: string): Promise<IDBNode[]> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index(INDEX_PARENT);
        const request = index.getAll(IDBKeyRange.only(folderPath));

        request.onsuccess = () => resolve(request.result as IDBNode[]);
        request.onerror = () => reject(request.error);
    });
}

/**
 * putNode — Insère ou met à jour un nœud (upsert).
 * Si un nœud avec le même path existe déjà, il est remplacé.
 */
function putNode(db: IDBDatabase, node: IDBNode): Promise<void> {
    return new Promise((resolve, reject) => {
        // 'readwrite' : nécessaire pour toute écriture.
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(node); // put = insert or replace (contrairement à add qui échoue si existe)

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * deleteNode — Supprime un nœud par son path.
 * ⚠️ Ne supprime PAS récursivement les enfants. Voir removeRecursive().
 */
function deleteNode(db: IDBDatabase, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(path);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * countNodes — Compte le nombre total de nœuds.
 * Utilisé par seedIfEmpty() pour détecter le 1er chargement.
 */
function countNodes(db: IDBDatabase): Promise<number> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — LOGIQUE MÉTIER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * seedIfEmpty — Insère les données initiales si la base est vide.
 *
 * Appelé une seule fois au démarrage, après ouverture de la base.
 * Si la base contient déjà des données (chargement ultérieur),
 * on ne fait rien → les données de l'utilisateur sont préservées.
 */
async function seedIfEmpty(db: IDBDatabase): Promise<void> {
    const count = await countNodes(db);
    if (count > 0) return; // Déjà seedé → on ne touche pas

    // Convertit l'arbre en tableau plat IDBNode[]
    const flat = flattenTree(INIT_FILESYSTEM, '');

    // Insère tous les nœuds en parallèle.
    // Promise.all attend que tous soient écrits avant de continuer.
    await Promise.all(flat.map((node) => putNode(db, node)));
}

/**
 * removeRecursive — Supprime un nœud et tous ses descendants.
 *
 * Pour un fichier : juste deleteNode.
 * Pour un dossier : on récupère d'abord tous les enfants via l'index,
 *                   puis on les supprime récursivement avant le dossier lui-même.
 *
 * Ordre important : supprimer les enfants AVANT le parent
 * (sinon les enfants deviennent orphelins mais restent dans IDB).
 */
async function removeRecursive(db: IDBDatabase, path: string): Promise<void> {
    const node = await getNode(db, path);
    if (!node) return; // Nœud inexistant → rien à faire

    if (node.type === 'folder') {
        // Récupère les enfants directs
        const children = await getByParent(db, path);
        // Supprime chaque enfant récursivement (en séquence pour éviter les conflits de tx)
        for (const child of children) {
            await removeRecursive(db, child.path);
        }
    }

    // Supprime le nœud lui-même (après ses enfants pour un dossier)
    await deleteNode(db, path);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useFilesystem — Hook React qui encapsule tout le système de fichiers IDB.
 *
 * Usage dans Home.tsx :
 *   const { tree, loading, error, ls, cat, mkdir, touch, write, rm } = useFilesystem();
 *
 * Usage dans le terminal :
 *   const children = await ls('/user/');           // ls
 *   const file = await cat('/user/ReadMe.md');     // cat
 *   await mkdir('/user/', 'nouveau/');             // mkdir
 *   await touch('/user/', 'notes.txt');            // touch
 *   await write('/user/notes.txt', 'contenu');     // echo > / vim
 *   await rm('/user/notes.txt');                   // rm
 *   await rm('/user/Sandbox/');                    // rm -r (récursif auto)
 */
export function useFilesystem() {
    // Instance de la base IDB (null jusqu'à ce qu'elle soit ouverte)
    const [db, setDb] = useState<IDBDatabase | null>(null);

    // Arbre FileNode[] reconstruit pour le mode graphique.
    // Mis à jour après chaque opération CRUD via refresh().
    const [tree, setTree] = useState<FileNode[]>([]);

    // États de chargement — évitent de render avant que la base soit prête.
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // ── Initialisation au montage ────────────────────────────────────────────
    useEffect(() => {
        // Flag d'annulation : évite les setState après démontage du composant
        // (React en strict mode monte/démonte deux fois en dev, ce flag est essentiel).
        let cancelled = false;

        (async () => {
            try {
                // 1. Ouvrir la base (création si 1er chargement)
                const database = await openDb();
                if (cancelled) return;

                // 2. Seeder si vide
                await seedIfEmpty(database);
                if (cancelled) return;

                // 3. Charger tous les nœuds et reconstruire l'arbre
                const allNodes = await getAllNodes(database);
                if (cancelled) return;

                setDb(database);
                setTree(buildTree(allNodes));
                setLoading(false);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Erreur IndexedDB inconnue');
                    setLoading(false);
                }
            }
        })();

        // Cleanup : marquer comme annulé si le composant se démonte
        return () => {
            cancelled = true;
        };
    }, []); // [] = exécuté une seule fois au montage

    // ── refresh ──────────────────────────────────────────────────────────────
    //
    // Relit TOUS les nœuds IDB et reconstruit l'arbre en mémoire.
    // Appelé automatiquement après chaque opération d'écriture (mkdir, touch, write, rm).
    //
    // useCallback : évite de recréer la fonction à chaque render
    //               (important car elle est dans les dépendances des autres callbacks).
    const refresh = useCallback(async () => {
        if (!db) return;
        const allNodes = await getAllNodes(db);
        setTree(buildTree(allNodes));
    }, [db]);

    // ── ls ───────────────────────────────────────────────────────────────────
    //
    // Liste les enfants DIRECTS d'un dossier.
    // Retourne un tableau d'IDBNode (pas de FileNode, c'est pour le terminal).
    //
    // Exemple :
    //   const items = await ls('/user/');
    //   // → [{ path: '/user/ReadMe.md', name: 'ReadMe.md', type: 'file', ... }, ...]
    const ls = useCallback(
        async (folderPath: string): Promise<IDBNode[]> => {
            if (!db) return [];
            return getByParent(db, folderPath);
        },
        [db]
    );

    // ── cat ──────────────────────────────────────────────────────────────────
    //
    // Lit un fichier par son chemin absolu.
    // Retourne undefined si le fichier n'existe pas.
    //
    // Exemple :
    //   const file = await cat('/user/ReadMe.md');
    //   console.log(file?.data); // "# Bienvenue..."
    const cat = useCallback(
        async (filePath: string): Promise<IDBNode | undefined> => {
            if (!db) return undefined;
            return getNode(db, filePath);
        },
        [db]
    );

    // ── mkdir ─────────────────────────────────────────────────────────────────
    //
    // Crée un dossier dans un parent donné.
    // Ajoute "/" à la fin du nom si absent (convention du projet).
    //
    // Exemple :
    //   await mkdir('/user/', 'nouveau');
    //   // → crée { path: '/user/nouveau/', name: 'nouveau/', type: 'folder', ... }
    const mkdir = useCallback(
        async (parentPath: string, name: string): Promise<void> => {
            if (!db) return;

            // Normalisation : assure que le nom de dossier se termine par "/"
            const normalizedName = name.endsWith('/') ? name : name + '/';
            const path = parentPath + normalizedName;
            const now = Date.now();

            await putNode(db, {
                path,
                name: normalizedName,
                type: 'folder',
                parentPath,
                createdAt: now,
                updatedAt: now
            });

            // Met à jour l'arbre en mémoire pour que le mode graphique re-render
            await refresh();
        },
        [db, refresh]
    );

    // ── touch ─────────────────────────────────────────────────────────────────
    //
    // Crée un fichier vide dans un parent donné.
    //
    // Exemple :
    //   await touch('/user/', 'notes.txt');
    //   // → crée { path: '/user/notes.txt', name: 'notes.txt', type: 'file', data: '', ... }
    const touch = useCallback(
        async (parentPath: string, name: string): Promise<void> => {
            if (!db) return;

            const path = parentPath + name;
            const now = Date.now();

            await putNode(db, {
                path,
                name,
                type: 'file',
                data: '',
                parentPath,
                createdAt: now,
                updatedAt: now
            });

            await refresh();
        },
        [db, refresh]
    );

    // ── write ─────────────────────────────────────────────────────────────────
    //
    // Écrit (remplace) le contenu d'un fichier existant.
    // Lance une erreur si le fichier n'existe pas (il faut touch() d'abord).
    //
    // Exemple :
    //   await write('/user/notes.txt', '# Mes notes\n\nContenu...');
    const write = useCallback(
        async (filePath: string, data: string): Promise<void> => {
            if (!db) return;

            const existing = await getNode(db, filePath);
            if (!existing) throw new Error(`${filePath} : fichier introuvable`);
            if (existing.type === 'folder') throw new Error(`${filePath} : est un dossier`);

            // On préserve toutes les métadonnées existantes (path, name, parentPath, createdAt)
            // et on met à jour uniquement data et updatedAt.
            await putNode(db, { ...existing, data, updatedAt: Date.now() });

            await refresh();
        },
        [db, refresh]
    );

    // ── rm ────────────────────────────────────────────────────────────────────
    //
    // Supprime un fichier ou un dossier (récursif automatiquement pour les dossiers).
    // Pas besoin de -r explicite : la récursion est gérée dans removeRecursive().
    //
    // Exemple :
    //   await rm('/user/notes.txt');      // supprime le fichier
    //   await rm('/user/Sandbox/');       // supprime le dossier et tout son contenu
    const rm = useCallback(
        async (path: string): Promise<void> => {
            if (!db) return;
            await removeRecursive(db, path);
            await refresh();
        },
        [db, refresh]
    );

    // ── Valeurs exposées ─────────────────────────────────────────────────────
    return {
        // ── État ──
        tree,       // FileNode[] — arbre reconstruit pour le mode graphique
        loading,    // true pendant l'ouverture IDB + seed
        error,      // string | null — message d'erreur si IDB échoue

        // ── CRUD (pour le terminal principalement) ──
        ls,     // (folderPath) → IDBNode[]        liste les enfants
        cat,    // (filePath)   → IDBNode | undefined  lit un fichier
        mkdir,  // (parentPath, name) → void       crée un dossier
        touch,  // (parentPath, name) → void       crée un fichier vide
        write,  // (filePath, data)   → void       écrit dans un fichier
        rm,     // (path)            → void       supprime (récursif)
    };
}
