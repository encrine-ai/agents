# CLAUDE.md — encrine-ai/agents (le système d'agents d'Encrine)

> Mémoire partagée entre les sessions. Lire d'abord README.md : il décrit tout le système.

- Ce dépôt est la **source de vérité** des agents d'Encrine (moteur, galerie, surveillance) :
  définitions (`agents/`), procédures (`procedures/`), battements de cœur (`status/`), identifiants
  installés (`deployed.json`). Ce qui tourne sur claude.ai s'installe d'ici avec `/installer-agents` ;
  l'état se lit avec `/verifier-agents`.
- Une session ouverte sur ce dépôt par le propriétaire sert d'ordinaire à : vérifier les agents, les
  réparer, ou changer ce qu'ils font. Retoucher les fichiers, `node tools/agents.cjs check`, commit
  et push sur `main`, puis `/installer-agents` seulement si ce qui vit sur claude.ai doit changer.
- Une session qui EST un agent (son titre est le `title` d'un agent) suit ses consignes et sa
  procédure, et finit par son battement de cœur.
- **Dépôt public** : aucun secret, aucune donnée personnelle, aucune donnée d'élève — jamais.
- **Tout est écrit en français** (fichiers, commits) ; ce que les agents écrivent sur GitHub, en
  anglais ; les consignes des agents (`agents/*.prompt.md`, l'amorce) en anglais. Auteur des
  commits : `Claude <noreply@anthropic.com>`, jamais l'adresse du propriétaire.
- **Avec le propriétaire (Jean-Louis, `jlrigau`)** : tutoiement, mots simples, sans jargon ; cause →
  réparation → ce qui a été vérifié et ce qui ne l'a PAS été. Les questions passent par
  `AskUserQuestion`, une à la fois.
- Dépôts liés : `encrine-ai/moteur` (le modèle, l'atelier et la boîte du moteur),
  `encrine-ai/encrine-ai.github.io` (le site, la galerie `classes.json`, les demandes de partage et
  les outils de relecture `outils/`), `encrine-ai/tour-du-monde` (la démonstration), les copies
  relues `encrine-ai/<id>`, et `jlrigau/grande-section` (la classe d'une enseignante, contenu validé :
  seul le moteur y est synchronisé).
- Ludea est un projet à part : voir le README, « Avec Ludea ».
