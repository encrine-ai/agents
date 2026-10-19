---
name: verifier-agents
description: Dire si les agents d'Encrine (moteur, galerie, surveillance) sont installés et ont vraiment tourné — battements de cœur dans status/, tâches planifiées, sessions — et ce qui attend le propriétaire. En lecture seule, sauf si quelque chose est cassé (alors proposer /installer-agents). Se déclenche sur : « /verifier-agents », « /check-agents », « check-agents », « est-ce que les agents tournent ? », « les agents ont tourné cette nuit ? », « où en sont les agents ? », « agent status ».
---

# verifier-agents (la vérification à la main)

Suivre `procedures/surveillance/verifier-agents.md` §1–2 (les battements, puis l'installation),
mais **ne rien relancer et ne pas écrire le battement de la surveillance** — c'est la question du
propriétaire, pas le passage du matin. `node tools/agents.cjs status` donne les battements d'un
coup d'œil (après `git pull --rebase origin main`). Répondre en français, mots simples, une ligne
par agent :
- a tourné cette nuit ou non (date, résultat), ce qui attend le propriétaire (`waitingForOwner`),
  où répondre (le titre de la session de l'agent) ;
- quelque chose de cassé → quoi, et la réparation (d'ordinaire `/installer-agents`, voir
  `DEPANNAGE.md`) ; une tâche qui porte encore ses consignes complètes (`"prompt": "complet"`
  dans `deployed.json`) → à remplacer par l'amorce, avec `/installer-agents`.
