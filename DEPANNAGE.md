# Dépannage des agents d'Encrine (pour Jean-Louis)

Tout le système est dans ce dépôt. Si quelque chose ne marche plus, voici quoi faire, du plus simple
au plus complet. Chaque cas : ce que tu vois → pourquoi → ce qu'on fait.

## Je veux savoir si tout tourne
Ouvre une session Claude Code sur **`encrine-ai/agents`** et tape **`/verifier-agents`**.
Elle te dit, agent par agent : a-t-il tourné cette nuit, qu'attend-il de toi, et où répondre.

Chaque matin vers 06:40, l'agent de surveillance le vérifie aussi tout seul. Il ne t'écrit que
s'il y a un problème.

## Pas de résumé « Moteur Encrine » ou « Galerie Encrine » ce matin
- **Pourquoi** : l'agent n'a pas tourné, ou s'est arrêté avant la fin.
- **Ce qu'on fait** :
  1. L'agent de surveillance l'a déjà relancé une fois. Attends sa notification « Agents Encrine :
     problème ».
  2. Toujours rien : ouvre une session sur `encrine-ai/agents` et tape **`/installer-agents`**.
     La commande compare ce qui doit tourner (les fichiers du dépôt) à ce qui tourne vraiment
     (claude.ai), recrée ce qui manque et vérifie que chaque agent a bien accès à GitHub.

## Un agent dit qu'un dépôt lui est refusé
- **Pourquoi** : l'application GitHub de Claude n'a pas le droit sur ce dépôt (un dépôt neuf, comme
  une copie de la galerie, ou `encrine-ai/agents` lui-même au début).
- **Ce qu'on fait** : autoriser ce dépôt dans les réglages GitHub de Claude ; `/installer-agents`
  te donne le lien exact et le nom du dépôt.

## Un agent me demande de cliquer sur GitHub
- **Pourquoi** : la session n'a pas le droit de créer ou de supprimer un dépôt, ni parfois de
  copier une classe ou d'allumer un site. C'est voulu : ces gestes-là sont les tiens.
- **Ce qu'on fait** : suivre le lien et le clic qu'il donne, exactement. Il reprend tout seul la
  nuit suivante, là où il s'était arrêté. En particulier, **une classe retirée de la galerie est
  supprimée par toi** (*Settings* → *Danger Zone* → *Delete this repository*) : l'agent te le
  redemande chaque matin tant que ce n'est pas fait.

## J'ai tout perdu (sessions supprimées, compte changé…)
Même chose : une session sur `encrine-ai/agents`, puis **`/installer-agents`**. Elle recrée les
trois sessions et les trois tâches planifiées à partir des fichiers. Rien d'autre n'est à
reconstituer : les consignes, les procédures et l'historique des passages sont dans ce dépôt.

## Je veux changer ce que fait un agent, ou son heure
Demande-le dans une session sur `encrine-ai/agents`. Le changement est fait dans les fichiers
(`agents/…`, `procedures/…`) et enregistré : le passage suivant s'en sert tout seul, car la tâche
planifiée ne contient qu'un petit texte (l'amorce) qui va lire ses consignes dans le dépôt. Pour
changer une heure, `/installer-agents` s'en charge.
Ne modifie jamais les consignes directement dans claude.ai : le dépôt ne refléterait plus la réalité.

## Où répondre aux agents
- **« OK »** pour une mise à jour du moteur : dans la session « Encrine – agent moteur (remontées) ».
- **« publie <classe> »**, « publie la mise à jour de <classe> », « retire <classe> » : dans la
  session « Encrine – agent galerie (publications) ».
- Ou sur GitHub : `OK` en commentaire (ou une revue *Approve*) sur la demande de fusion du moteur,
  `/accept` sur la demande de partage.
- Ton OK vaut pour ce que tu as vu : si l'agent ajoute quelque chose ensuite, il te le redemande.

## Pièges connus
- Une tâche planifiée qui crée **une nouvelle session à chaque fois** démarre sans accès aux
  dépôts : l'agent s'arrête au bout de 30 secondes (c'est arrivé à Ludea la nuit du 19 octobre
  2026). On utilise toujours une session permanente, réveillée par la tâche planifiée.
- Une session ne peut ni créer ni supprimer un dépôt sur GitHub : c'est toi qui le fais sur
  github.com.
- Si la surveillance dit qu'un agent « travaille encore » au matin, ce n'est pas une panne : son
  passage a été long (beaucoup de classes à contrôler). Elle ne le relance pas ; regarde son
  résumé un peu plus tard.
