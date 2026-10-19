---
name: installer-agents
description: Installer, réparer ou mettre à jour le système d'agents d'Encrine sur le compte claude.ai du propriétaire depuis CE dépôt — la session permanente et la tâche planifiée de chaque agent de agents/*.json (moteur, galerie, surveillance), avec leur amorce exacte, puis la vérification de la mise en route de chaque session et deployed.json. À lancer après un changement de agents/ (un agent, une heure, un dépôt), quand deployed.json dit "prompt" "complet" (une tâche d'avant l'amorce), ou quand la surveillance ou le propriétaire dit qu'un agent est cassé ou a disparu. Se déclenche sur : « /installer-agents », « /install-agents », « install-agents », « installe les agents », « réinstalle les agents », « les agents ne tournent plus », « mets à jour les agents », « répare les agents », « repair the agents ».
---

# installer-agents (ce dépôt → les agents qui tournent)

Ce dépôt est la **source de vérité**. Une tâche planifiée ne porte qu'une **amorce**
(`node tools/agents.cjs stub <id>`) : elle met ce dépôt à jour et lance `agents/<id>.prompt.md`.
Donc :
- **changer ce que fait un agent** = retoucher `agents/<id>.prompt.md` ou sa procédure, commit,
  push — le passage suivant s'en sert, **rien à réinstaller** ;
- **ce skill** sert à ce qui vit sur claude.ai : une session ou une tâche manquante ou cassée, un
  nouvel agent, une nouvelle heure, une nouvelle amorce, une tâche qui porte encore ses consignes
  complètes (`"prompt": "complet"` dans `deployed.json`).
Règle de claude.ai : le prompt d'une tâche planifiée ne se modifie **que depuis la session où elle
dépose son message** (`update_trigger` d'ailleurs est refusé). D'où l'amorce, qui ne change jamais ;
une tâche dont le prompt doit changer est **remplacée** (nouvelle session + nouvelle tâche,
l'ancienne tâche désactivée).

Tout ce qui est dit au propriétaire : en français, sans jargon, tutoiement.

## 0. Les outils
Les outils claude-code-remote : `list_triggers`, `get_trigger`, `create_session`, `create_trigger`,
`update_trigger`, `fire_trigger`, `get_session`, `list_events`, `set_session_title`,
`read_documentation` (ToolSearch « claude-code-remote » s'ils ne sont pas chargés).
`node tools/agents.cjs check` doit passer, et ce dépôt doit être poussé sur `main`
(`git log origin/main -1` = `HEAD`) : les sessions le clonent depuis GitHub.

## 1. Lire ce qui doit tourner, et ce qui tourne
- `node tools/agents.cjs list`, et pour chaque agent `node tools/agents.cjs stub <id>` (le texte
  exact de sa tâche — le passer tel quel, jamais retapé).
- `deployed.json` (les identifiants installés la dernière fois) et `list_triggers` (ce qui existe
  vraiment ; `get_trigger` pour lire le prompt d'une tâche).

## 2. Par agent — garder ce qui marche, recréer ce qui ne marche pas
**La session** (une session permanente par agent) :
- `deployed.json` a une session, elle existe encore, n'est pas archivée, n'est pas `failed`, **et**
  la tâche qui la réveille peut garder son prompt (point suivant) → la garder.
- Sinon en créer une : `create_session` avec `title` = le `title` de l'agent, `source_url` =
  `https://github.com/encrine-ai/agents`, `permission_mode` = son `permissionMode` (`auto`), le même
  environnement que cette session (omettre `environment_id`), et un premier message de MISE EN
  ROUTE SEULEMENT :
  « Setup check only — do NOT run the agent's job. Make sure encrine-ai/agents is cloned at
  /home/user/agents (add_repo push + clone). Read /home/user/agents/agents/<id>.json; for each repo
  listed, call add_repo with its access, clone it under /home/user in a fresh clone, check
  `git remote get-url origin`, and report in one line per repo: cloned / denied (with the exact
  reason). Then check that the GitHub MCP tools load (ToolSearch "github issue") and that
  `gh api repos/encrine-ai/agents` answers. For the surveillance agent, also check that
  list_triggers and get_session load. Reply with the list. »
- **Jamais** de tâche qui crée une nouvelle session à chaque fois (`create_new_session_on_fire`) :
  ces sessions démarrent SANS les dépôts ni les outils GitHub — c'est ce qui a cassé Ludea la nuit
  du 19 octobre 2026 (les deux agents arrêtés au bout de 30 s).

**La tâche planifiée** (liée à cette session) :
- Elle existe dans `deployed.json` et dans `list_triggers`, son prompt est **égal à l'amorce**, sa
  session est gardée → la garder (`update_trigger` pour `cron_expression` / `enabled` s'ils ont
  changé — permis d'ici ; son prompt, non).
- Son prompt n'est pas l'amorce (`"prompt": "complet"`, ou une ancienne amorce) → la **remplacer** :
  nouvelle session (ci-dessus) + nouvelle tâche, puis désactiver l'ancienne. Exception possible,
  si le propriétaire le préfère pour garder la conversation de la session : il écrit lui-même,
  **dans** l'ancienne session, « Remplace le prompt de ta tâche planifiée <trigger> par ce texte,
  exactement : <amorce> » — c'est son message, la session peut alors faire `update_trigger` sur sa
  propre tâche ; vérifier ensuite avec `get_trigger`.
- Sinon `create_trigger` avec `name` = le titre, `cron_expression` = `schedule`,
  `persistent_session_id` = la session, `prompt` = l'amorce, `initiation: "human_request"`.
- La tâche remplacée → `update_trigger enabled:false` (permis d'ici) ; la supprimer seulement si le
  propriétaire le demande. Sa session → `set_session_title` « ANCIENNE session – <titre> », pour
  qu'il n'y réponde plus. Ne pas toucher aux autres tâches du compte (Ludea, les rappels…).

## 3. Vérifier
- Attendre la réponse de mise en route de chaque NOUVELLE session (`list_events`, ou demander au
  propriétaire de regarder) : chaque dépôt `cloned`, aucun `denied`. Un refus → le propriétaire
  doit autoriser ce dépôt (lire `read_documentation` topic `github.access` et relayer ses étapes)
  — dire exactement lequel. `encrine-ai/agents` lui-même est le premier à vérifier : sans lui,
  pas d'amorce qui tienne.
- `get_trigger` de chaque tâche créée : `enabled`, la bonne heure, le prompt = l'amorce,
  `persistent_session_id` = la bonne session.
- `node tools/agents.cjs status` → les battements. Ne pas lancer un passage complet pour essayer,
  sauf si le propriétaire le demande (il fait du vrai travail : issues, fusions, publications).

## 4. Enregistrer
Réécrire `deployed.json` (`installedAt`, `installedBy: "installer-agents (<id de cette session>)"`,
par agent `session`, `trigger`, `prompt: "stub"`, `promptVersion` = le hash court de `HEAD` de ce
dépôt ; les remplacés dans `replaced`, avec leur état), `node tools/agents.cjs check`, commit
« Agents installés : <ce qui a changé> » (auteur `Claude <noreply@anthropic.com>`), push sur `main`.
Puis dire au propriétaire, en français : ce qui a été créé / mis à jour / gardé, les prochaines
heures de passage, ce qui n'a PAS été vérifié, et où répondre à chaque agent désormais (le titre
de sa session).

## Garde-fous
- Seulement les agents de ce dépôt ; jamais les autres tâches ou sessions du compte (Ludea en a
  sur le même compte : ne pas y toucher, ne pas les lire).
- Jamais de secret (jeton, mot de passe) dans ce dépôt — il est public.
- Ne jamais désactiver ou renommer une session qui porte une question sans réponse du
  propriétaire (un lot qui attend son « OK », une classe qui attend « publie … ») sans le lui
  dire : il répondrait au mauvais endroit. Dans ce cas, lui dire de répondre d'abord, ou que la
  nouvelle session reprendra la question à son premier passage (la question vit aussi sur GitHub).
