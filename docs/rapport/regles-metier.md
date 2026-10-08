# Règles de gestion du diagramme de classes

| Règles | Description |
|---|---|
| R1 | Une instance de la classe Compte utilisateur possède une ou plusieurs instances de la classe Entreprise. Une instance de la classe Entreprise appartient à une seule instance de la classe Compte utilisateur. |
| R2 | Une instance de la classe Entreprise possède au plus une instance de la classe Identité visuelle. Une instance de la classe Identité visuelle correspond à une seule instance de la classe Entreprise. |
| R3 | Une instance de la classe Entreprise possède zéro ou plusieurs instances de la classe Site web, au plus une par modèle de site. Une instance de la classe Site web appartient à une seule instance de la classe Entreprise. |
| R4 | Une instance de la classe Site web utilise une seule instance de la classe Modèle de site. Une instance de la classe Modèle de site est utilisée par zéro ou plusieurs instances de la classe Site web. |
| R5 | Une instance de la classe Entreprise mène zéro ou plusieurs instances de la classe Projet. Une instance de la classe Projet est menée par une seule instance de la classe Entreprise. |
| R6 | Une instance de la classe Projet possède au plus une instance de la classe Étude de faisabilité. Une instance de la classe Étude de faisabilité correspond à une seule instance de la classe Projet. |
| R7 | Une instance de la classe Projet possède au plus une instance de la classe Business plan. Une instance de la classe Business plan correspond à une seule instance de la classe Projet et s'appuie sur l'instance de la classe Étude de faisabilité de ce projet. |
| R8 | Une instance de la classe Entrepreneur fait zéro ou plusieurs instances de la classe Demande. Une instance de la classe Demande est faite par une seule instance de la classe Entrepreneur et est reçue par une seule instance de la classe Administrateur. |
| R9 | Une instance de la classe Administrateur reçoit zéro ou plusieurs instances de la classe Demande et gère plusieurs instances de la classe Compte utilisateur. |
| R10 | Une instance de la classe Entrepreneur Pro possède une seule instance de la classe Abonnement. Une instance de la classe Abonnement appartient à une seule instance de la classe Entrepreneur Pro. |
| R11 | Une instance de la classe Compte utilisateur reçoit zéro ou plusieurs instances de la classe Notification. Une instance de la classe Notification est adressée à une seule instance de la classe Compte utilisateur. |

Contraintes complémentaires (hors associations) :
- Un site web ne peut être publié que si son entreprise a renseigné son nom et ses coordonnées. Un entrepreneur sans abonnement ne peut avoir qu'un seul site publié à la fois.
- Un business plan ne peut être créé que si l'étude de faisabilité du projet a le statut « générée ».
