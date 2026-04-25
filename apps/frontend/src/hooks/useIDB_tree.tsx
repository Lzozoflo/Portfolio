import { useState, useEffect, useCallback, Children } from 'react';

import type { IDBNode, FileNode } from '@portfolio/shared';



const DB_NAME = 'IDB_tree';         // Nom de la base IDB (visible dans DevTools → Application → IndexedDB)
const DB_VERSION = 1;               // Version du schéma. Incrémenter quand on modifie le schéma IDB.
const STORE_NAME = 'tree';          // Nom de l'ObjectStore (≈ table SQL)
const INDEX_PARENT = 'by_parent';   // Nom de l'index sur parentPath (permet ls() en O(1))

// ── Creation database ────────────────────────────────────────────────────────────────

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            // On crée la "table" avec 'path' comme clé primaire
            const store = db.createObjectStore(STORE_NAME, { keyPath: "path" });

            
            // On crée un index pour chercher par parentPath ultra rapidement
            store.createIndex(INDEX_PARENT, "parentPath");
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


// ── Creation database ────────────────────────────────────────────────────────────────

// ── Recuperation de la data depuis le repo github ────────────────────────────────────────────────────────────────

type objectGithub = {
    sha         :   string,
    url         :   string,
    path?       :   string,
    mode?       :   string,
    type?       :   string,
    node_id?    :   string,
    size?       :   number,
    content?    :   string,
    encoding?   :   string,
}

async function convert64(item: objectGithub){

    const response = await fetch(item.url);
    const repjson = await response.json();
    
    const binString = atob(repjson.content.replace(/\s/g, ''));
    
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) ?? 0);

    const decoded = new TextDecoder().decode(bytes);
    
    return decoded
}

async function fetchGithubRepo(): Promise<IDBNode[]> {
    const date = Date.now();
    const response = await fetch("https://api.github.com/repos/Lzozoflo/Portfolio/git/trees/site_file?recursive=1");
    const data = await response.json();

    const rawItems: objectGithub[] = data.tree;

    let nodes: IDBNode[] = await Promise.all(rawItems.map(async (item) => {
        const isFolder = item.type === 'tree';
        
        const fullPath = '/' + item.path + (isFolder ? '/' : '');
        
        const segments = item.path?.split('/').filter(Boolean);
        segments?.pop();
        const parentPath = segments?.length === 0 ? '/' : '/' + segments?.join('/') + '/';

        return {
            path: fullPath,
            name: item.path?.split('/').pop() + (item.type === 'tree' ? '/' : '') || '',
            type: isFolder ? 'folder' : 'file',
            parentPath: parentPath,
            childrenPath: [],
            data: item.type === 'blob' ? await convert64(item) : undefined,
            createdAt: date,
            updatedAt: date
        };
    }));
    
    nodes.push({
        path: '/',
        name: '/',
        type: 'folder',
        parentPath: undefined,
        childrenPath: [],
        data: undefined,
        createdAt: date,
        updatedAt: date
    });
    nodes.forEach(node => {
        const parent = nodes.find(n => n.path === node.parentPath);
        if (parent) {
            parent.childrenPath.push(node.path);
        }
    });

    return nodes;
}

// ── Recuperation de la data depuis le repo github ────────────────────────────────────────────────────────────────


// ── Utilitaire ────────────────────────────────────────────────────────────────

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
        console.log("request",request);
        
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


function buildTree(nodes: IDBNode[]): {fileNode:FileNode[], idbNode:IDBNode[]} {
    const map = new Map<string, FileNode>();

    for (const n of nodes) {
        map.set(n.path, {
            name: n.name,
            type: n.type,
            children: n.type === 'folder' ? [] : undefined
        });
    }

    const roots: FileNode[] = [];

    for (const n of nodes) {
        const node = map.get(n.path)!; // Garanti présent (on vient de set)

        if (n.parentPath === '/home/') {
            // Pas de parent → c'est un nœud racine (ex: "/")
            roots.push(node);
        } else if (n.parentPath) {
            const parent = map.get(n.parentPath);
            if (parent?.children) {
                parent.children.push(node);
            }
        }
    }
    console.log('buildTree' ,roots);
    return {fileNode: roots, idbNode: nodes};
}

async function removeRecursive(db: IDBDatabase, path: string): Promise<void> {
    const node = await getNode(db, path);
    if (!node) return; // Nœud inexistant → console.error();
    
    if (node.type === 'folder') {
        const children = await getByParent(db, path);
        // Supprime chaque enfant récursivement (en séquence pour éviter les conflits de tx)
        for (const child of children) {
            await removeRecursive(db, child.path);
        }
    }

    await deleteNode(db, path);
}


// ── Utilitaire ────────────────────────────────────────────────────────────────

// ── Core ────────────────────────────────────────────────────────────────

export function useIDB_tree(){

    // Instance de la base IDB (null jusqu'à ce qu'elle soit ouverte)
    const [db, setDb] = useState<IDBDatabase | null>(null);

    // Arbre FileNode[] reconstruit pour le mode graphique.
    // Mis à jour après chaque opération CRUD via refresh().
    const [tree, setTree] = useState<{fileNode:FileNode[], idbNode: IDBNode[]}>({fileNode:[],idbNode:[]});

    // États de chargement — évitent de render avant que la base soit prête.
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // ── Initialisation au montage ────────────────────────────────────────────

    useEffect(() => {

        let cancelled = false;

        (async () => {
            try {
                const database = await openDatabase();
                if (cancelled) return;
                
                if (await countNodes(database) !== 0){
                    const allNodes = await getAllNodes(database);
                    if (cancelled || allNodes.length === 0){
                        return;
                    }
                    
                    setDb(database);
                    setTree(buildTree(allNodes));
                    setLoading(false);
                    return;
                }
                const fetchedGithubRepo = await fetchGithubRepo();
                if (cancelled) return;

                console.log("fetchedGithubRepo: ",fetchedGithubRepo);
                if (cancelled) return;

                await Promise.all(fetchedGithubRepo.map((node) => putNode(database, node)));
                if (cancelled) return;

                const allNodes = await getAllNodes(database);
                if (cancelled || allNodes.length === 0){
                    return
                }

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

        return () => {
            cancelled = true;
        };

    }, []);


    const resetDatabase: () => Promise<void> = useCallback(async () => {
        const request = indexedDB.deleteDatabase(DB_NAME);

        request.onsuccess = () => {
            console.log("Base de données IndexedDB supprimée avec succès");
            window.location.reload(); 
        };

        request.onerror = () => {
            console.error("Erreur lors de la suppression de la base de données");
        };

        request.onblocked = () => {
            alert("Suppression en cours : Veuillez fermer les autres onglets ouverts.");
        };
    }, []);

    // ── refresh ──────────────────────────────────────────────────────────────
    //
    // Relit TOUS les nœuds IDB et reconstruit l'arbre en mémoire.
    // Appelé automatiquement après chaque opération d'écriture (mkdir, touch, write, rm).
    //
    const refresh: () => Promise<void> = useCallback(async () => {
        if (!db) return;
        const allNodes = await getAllNodes(db);
        setTree(buildTree(allNodes));
    }, [db]);

    // ── ls ──────────────────────────────────────────────────────────────────
    //
    // Lit un fichier par son chemin absolu.
    // Retourne undefined si le fichier n'existe pas.
    //
    // Exemple :
    //   const file = await ls('/user/ReadMe.md');
    //   console.log(file?.data); // "# Bienvenue..."
    const ls: (filePath: string) => Promise<IDBNode | undefined> = useCallback(
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
    //
    const mkdir: (parentPath: string, name: string) => Promise<void> = useCallback(
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
                childrenPath: [],
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
    const touch: (parentPath: string, name: string) => Promise<void> = useCallback(
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
                childrenPath: [],
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
    const write: (filePath: string, data: string) => Promise<void> = useCallback(
        async (filePath: string, data: string): Promise<void> => {
            if (!db) return;

            const existing = await getNode(db, filePath);
            if (!existing) throw new Error(`${filePath} : fichier introuvable`);
            if (existing.type === 'folder') throw new Error(`${filePath} : est un dossier`);

            // On préserve toutes les métadonnées existantes (path, name, parentPath, createdAt)
            // et on met à jour uniquement data et updatedAt.
            const tmpNode = { ...existing, data, updatedAt: Date.now() };
            console.log(tmpNode);
            await putNode(db, { ...existing, data, updatedAt: Date.now() });
            const existing2 = await getNode(db, filePath);

            console.log("existing2:",existing2);
        },
        [db, refresh]
    );

    // ── cat ──────────────────────────────────────────────────────────────────
    //
    // Lit un fichier par son chemin absolu.
    // Retourne undefined si le fichier n'existe pas.
    //
    // Exemple :
    //   const file = await cat('/user/ReadMe.md');
    //   console.log(file?.data); // "# Bienvenue..."
    const cat: (filePath: string) => Promise<IDBNode | undefined> = useCallback(
        async (filePath: string): Promise<IDBNode | undefined> => {
            if (!db) return undefined;
            return getNode(db, filePath);
        },
        [db]
    );

    // ── rm ────────────────────────────────────────────────────────────────────
    //
    // Supprime un fichier ou un dossier (récursif automatiquement pour les dossiers).
    // Pas besoin de -r explicite : la récursion est gérée dans removeRecursive().
    //
    // Exemple :
    //   await rm('/user/notes.txt');      // supprime le fichier
    //   await rm('/user/Sandbox/');       // supprime le dossier et tout son contenu
    const rm: (path: string) => Promise<void> = useCallback(
        async (path: string): Promise<void> => {
            if (!db) return;
            await removeRecursive(db, path);
            await refresh();
        },
        [db, refresh]
    );

    // ── test ──────────────────────────────────────────────────────────────────
    // Exemple :
    //   await rm('/user/notes.txt');      // supprime le fichier
    //   await rm('/user/Sandbox/');       // supprime le dossier et tout son contenu
    const test: (path: string) => Promise<boolean> = useCallback(
        async (path: string): Promise<boolean> => {
            if (!db) return false;
            const existing = await getNode(db, path);
            return existing ? true : false
        },
        [db, refresh]
    );
    // ── Valeurs exposées ─────────────────────────────────────────────────────
    return {
        // ── État ──
        tree,       // FileNode[] — arbre reconstruit pour le mode graphique
        loading,    // true pendant l'ouverture IDB + seed
        error,      // string | null — message d'erreur si IDB échoue

        // ── CMD (pour le terminal principalement) ──
        test,           // (path)               → boolean                   return true = existe / false = existe pas
        ls,             // (dirPath)            → string[]  | undefined     return un tab des differant dossier a pwd
        cat,            // (filePath)           → IDBNode   | undefined     lit un fichier
        mkdir,          // (parentPath, name)   → void                      crée un dossier
        touch,          // (parentPath, name)   → void                      crée un fichier vide
        write,          // (filePath, data)     → void                      écrit dans un fichier
        rm,             // (path)               → void                      supprime (récursif)
        resetDatabase,  // (void)               → void                      supprime la databases et refresh la page
    };

}