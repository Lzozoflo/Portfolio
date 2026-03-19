Logique Algorithmique : Le Snake "Basicobasique"

1. Structure de Données et État du Jeu

Le Grille : Utiliser un système de coordonnées $(x, y)$ basé sur une taille de cellule fixe (ex: 20px).

Le Serpent : Modélisé par une file (queue) ou un tableau d'objets [{x, y}, ...]. La tête est le premier élément, la queue est le dernier.

La Nourriture : Un simple objet {x, y} dont les coordonnées sont générées aléatoirement mais alignées sur la grille.

Direction : Un vecteur de mouvement {dx, dy} (ex: {1, 0} pour la droite).

2. La Boucle de Jeu (Game Loop)

Utiliser setInterval ou requestAnimationFrame pour cadencer le mouvement (ex: toutes le 100ms).

Calcul de la nouvelle tête : nouvelleTete = {x: tete.x + dx, y: tete.y + dy}.

Mise à jour : Ajouter la nouvelleTete au début du tableau du serpent.

3. Gestion des Collisions et Croissance

Manger : Si nouvelleTete == nourriture, ne pas supprimer le dernier élément du tableau (le serpent grandit). Générer une nouvelle position pour la nourriture.

Avancer : Si aucune nourriture n'est mangée, supprimer le dernier élément du tableau (pop) pour maintenir la taille.

Game Over : Vérifier si nouvelleTete touche un bord du canvas ou si ses coordonnées existent déjà dans le reste du corps du serpent.

4. Entrées Utilisateur (Inputs)

Écouter les événements clavier (keydown).

Règle d'or : Empêcher le demi-tour direct (ex: si direction = gauche, ignorer l'entrée "droite") pour éviter l'auto-collision instantanée.