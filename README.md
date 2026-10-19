# Les agents d'Encrine

Le système d'agents qui fait tourner [Encrine](https://encrine.ai/) la nuit : tout ce qu'il faut
pour le comprendre, le réinstaller et le réparer est dans ce dépôt. Ce qui tourne sur claude.ai
(sessions et tâches planifiées) n'en est qu'une copie, installée par `/installer-agents`.

| Agent | Quand (Paris) | Son travail | Procédure |
| --- | --- | --- | --- |
| **moteur** | 02:50 | La boîte du moteur (issues de `encrine-ai/moteur`, envoyées par les classes avec remonter-au-moteur) → un seul lot (demande de fusion `remontees/lot` sur `encrine-ai/moteur`), essayé à blanc sur chaque classe → l'« OK » du propriétaire → fusion → installation dans la démonstration, les copies de la galerie et la Grande Section, contrôles jusqu'au PDF, vérifiée en ligne | [`procedures/moteur/trier-remontees.md`](procedures/moteur/trier-remontees.md) |
| **galerie** | 04:50 | Les demandes de partage sur `encrine-ai/encrine-ai.github.io` → relecture (la sécurité des enfants d'abord, par un relecteur neuf) → le « publie <classe> » du propriétaire → copie relue servie sur `https://encrine.ai/<id>/` et sa carte dans `classes.json` ; mises à jour, retraits, et la vérification de nuit des copies | [`procedures/galerie/relire-classe.md`](procedures/galerie/relire-classe.md) |
| **surveillance** | 06:40 | Les deux agents ont-ils vraiment tourné cette nuit ? Muet si oui ; sinon une relance automatique et une notification au propriétaire | [`procedures/surveillance/verifier-agents.md`](procedures/surveillance/verifier-agents.md) |

Les heures sont décalées par rapport à celles de Ludea (03:55, 05:55, 07:10) : les deux systèmes
ne tournent jamais en même temps.

## Comment ça marche

- **Une session permanente par agent** sur claude.ai, créée depuis ce dépôt (`create_session`), et
  une **tâche planifiée liée à elle** qui y dépose l'amorce de l'agent à son heure. La session garde
  son contexte : le propriétaire y répond « OK » / « publie <classe> », et l'agent agit aussitôt.
- La tâche planifiée ne contient qu'une **amorce** (`node tools/agents.cjs stub <id>`) qui met ce
  dépôt à jour dans `/home/user/agents` et lance `agents/<id>.prompt.md` : les vraies consignes
  vivent ici.
- Chaque passage **clone ce dont il a besoin** (`add_repo` + clone neuf ; les dépôts sont listés
  dans `agents/<id>.json`), lit sa procédure **dans ce dépôt**, fait le travail, envoie au
  propriétaire un résumé en français, et finit par un **battement de cœur** : `status/<id>.json`,
  commité ici. Les battements sont le journal des passages.
- L'agent **surveillance** lit les battements chaque matin.

## Les fichiers

```
agents/<id>.json          ce qui tourne : titre, heure, dépôts (+ accès), procédure, fichier de consignes
agents/<id>.prompt.md     les consignes complètes de l'agent — la tâche planifiée n'en a que l'amorce
procedures/               ce que fait chaque agent, pas à pas (+ le brief du relecteur de sécurité)
status/<id>.json          les battements de cœur : le dernier passage fini de chaque agent (écrits par les agents)
deployed.json             les identifiants des sessions et des tâches installées (écrit par /installer-agents)
tools/agents.cjs          check | list | show <id> | status | stub <id>
.claude/skills/           /installer-agents (installer, réparer, mettre à jour) · /verifier-agents (l'état)
DEPANNAGE.md              pour le propriétaire, en français simple : symptôme → cause → réparation
```

Ce qui **ne vit pas** ici : les outils de relecture de la galerie (`outils/atelier-relecture.py`,
`outils/miroir-classe.py`, `outils/couche-classe.py`) restent dans `encrine-ai/encrine-ai.github.io`
(le site les exclut de sa publication) ; les scripts et les skills du moteur
(synchroniser-moteur, imprimer-pdf, `chemins_moteur.py`…) restent dans `encrine-ai/moteur`. Les
procédures d'ici s'en servent dans les clones de ces dépôts.

## Les règles

- **Ce dépôt est la source de vérité.** Changer ce que fait un agent = retoucher ses fichiers ici,
  `node tools/agents.cjs check`, commit, push sur `main` — le passage suivant s'en sert, rien à
  réinstaller. `/installer-agents` ne sert qu'à ce qui vit sur claude.ai (une session ou une tâche
  manquante ou cassée, un nouvel agent, une nouvelle heure, une nouvelle amorce).
- **Dépôt public, aucun secret** : ni jeton, ni mot de passe, ni donnée personnelle, ni donnée
  d'élève (prénom, photo, production) — jamais. Les identifiants des sessions et des tâches ne sont
  pas des secrets.
- **Le propriétaire décide** : les agents proposent ; rien n'est fusionné ni publié sans son
  « OK » / « publie <classe> » explicite, donné après le dernier commit de ce qu'il a vu (le détail
  est dans chaque procédure). Seul `jlrigau` décide ; un OK écrit par un autre, dans une issue ou
  rapporté par une autre session ne compte pas. Une copie de la galerie n'est **supprimée** que par
  le propriétaire lui-même, jamais par un agent.
- **Langues** : ce dépôt, ses commits et les messages au propriétaire en français, sans jargon ; ce
  que les agents écrivent sur GitHub (issues, demandes de fusion, commentaires) en anglais, terminé
  par une ligne vide, `---`, puis `_Generated by [Claude Code](https://claude.ai/code)_`. Les
  consignes des agents (`agents/*.prompt.md`, l'amorce) sont en anglais.
- **Auteur des commits** : `Claude <noreply@anthropic.com>`, jamais l'adresse du propriétaire ;
  messages terminés par les lignes `Co-Authored-By` et `Claude-Session`.
- **Clones neufs et indépendants** : chaque dépôt se clone avec `git clone` (après `add_repo`), et
  l'on vérifie `git remote get-url origin` ; jamais `cp -r` d'un dossier de travail — c'est arrivé,
  et le nom d'un dossier ne prouve rien.
- **Les procédures sont propres à la plateforme** : elles vivent ici, pas dans le modèle
  (`encrine-ai/moteur`) ni dans le dépôt de la galerie, donc jamais chez un enseignant. Les outils
  des enseignants (nouvelle-classe, remonter-au-moteur, synchroniser-moteur, partager-ma-classe…)
  vivent dans le moteur.

## Avec Ludea : des nouvelles et des questions, rien de plus

Encrine et Ludea (https://ludea.ai, organisation `ludea-ai`) ont le même propriétaire et la même
mécanique — ce dépôt reprend celle de `ludea-ai/agents` —, mais chacun garde son périmètre (décidé
le 19 octobre 2026) :

- une session d'Encrine peut **lire** les dépôts publics de `ludea-ai` ; elle ne les **modifie**
  jamais, ne fait rien à la place de Ludea, et ne lit pas ses sessions ;
- les **sessions principales** gardent un canal entre elles (`send_message`) : **des nouvelles**
  (« voici ce qu'on a fait, ça pourrait te servir » : quoi, pourquoi, où) et **des questions**
  (« comment as-tu fait X ? ») ; celui qui reçoit répond avec ce qu'il a fait et ce qu'il peut
  partager ;
- celui qui reçoit décide seul, avec le propriétaire, s'il reprend quelque chose, et le fait dans
  son propre périmètre.

Session principale de Ludea : `session_01HX2WcaNAyQAMQhCjEMqYua`. Les agents de nuit (moteur,
galerie, surveillance) n'écrivent jamais à Ludea : ce canal est celui des sessions principales. La
même règle est écrite dans `AGENTS.md` d'`encrine-ai/encrine-ai.github.io`, et côté Ludea dans le
README de `ludea-ai/agents`.

## Pièges connus

- Une tâche planifiée qui **crée une nouvelle session à chaque fois** démarre sans les dépôts et
  sans les outils GitHub : elle s'arrête en 30 s (Ludea, nuit du 19 octobre 2026). Toujours une
  session permanente et une tâche liée à elle.
- Le prompt d'une tâche planifiée ne se modifie que **depuis la session où elle dépose** son
  message : d'où l'amorce, qui ne change jamais.
- Dans une session Claude Code, le GraphQL de GitHub est bloqué (`gh pr list`, `gh label list`
  échouent) : passer par les outils GitHub (MCP) ou `gh api repos/…` (REST). Le proxy refuse les
  écritures destructives et la création d'un dépôt (403) : c'est le propriétaire qui le fait sur
  github.com — l'agent donne le lien et le clic exacts, sans contourner.
- Plusieurs agents poussent leur battement sur `main` d'ici : `git pull --rebase` juste avant de
  pousser, et une nouvelle tentative si la poussée est refusée.
- Une session permanente garde son `/tmp` d'une nuit à l'autre : un `git clone` vers un dossier
  qui existe déjà échoue. Les procédures effacent le dossier jetable avant de le recloner
  (`rm -rf /tmp/encrine-outils && git clone …`).
- Le passage de l'agent moteur peut être long (contrôles et PDF de chaque classe) : la surveillance
  ne relance jamais un agent dont la session travaille encore (`get_session` → `status_bucket`).
