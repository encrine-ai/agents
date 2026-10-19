# verifier-agents — la procédure de la surveillance (et la vérification à la main)

Répond chaque matin à une seule question : **chaque agent de nuit a-t-il vraiment tourné, et le
système est-il toujours installé ?** Suivie par l'agent surveillance (06:40, Paris) et par le skill
`verifier-agents` quand le propriétaire demande « est-ce que les agents tournent ? ».

Les agents surveillés : ceux de `agents/*.json` sauf `surveillance` lui-même — aujourd'hui
**moteur** (02:50) et **galerie** (04:50).

## 1. Les battements de cœur (la preuve qu'un passage est allé au bout)

`git -C /home/user/agents pull --rebase origin main`, puis lire `status/moteur.json` et
`status/galerie.json`. Chaque passage de ces agents finit par écrire son battement (dernière
section de leur procédure).

- `date` = aujourd'hui (heure de Paris) → il a tourné. Noter `result` (`ok`, `nothing-new`,
  `blocked`, `error`) et `waitingForOwner`.
- Absent, ou daté d'avant aujourd'hui → **aucun passage fini cette nuit**.

## 2. L'installation (est-ce toujours branché ?)

Les outils claude-code-remote (ToolSearch « list_triggers get_session fire_trigger »).

- `list_triggers` : les tâches nommées dans `deployed.json` existent, sont `enabled`, n'ont ni
  `ended_reason` ni `suspension_reason`, et leur `last_run.fired_at` est d'aujourd'hui pour celles
  de la nuit. Une tâche absente, désactivée ou suspendue = l'installation est cassée.
- `get_session` sur chaque session de `deployed.json` : elle existe, n'est pas archivée, et son
  `status_bucket` n'est pas `failed`. **`working`** = l'agent travaille encore (un passage long :
  beaucoup de classes à contrôler et à imprimer) — ce n'est pas une panne.
- `deployed.json` dit `"prompt": "complet"` pour un agent : sa tâche porte encore les anciennes
  consignes complètes, pas l'amorce. Le signaler (une ligne, sans notification si tout a tourné) :
  `/installer-agents` doit la remplacer.

## 3. Agir

- **Tout va bien** → une ligne en français pour réponse (« Agents Encrine : tout a tourné cette
  nuit. » + ce qui attend le propriétaire, tiré de `waitingForOwner`, et où répondre), pas de
  notification.
- **Pas de battement, la session travaille encore** (`status_bucket: working`) → **ne rien
  relancer** (deux passages en même temps se marcheraient dessus). Le dire dans la réponse
  (« l'agent moteur travaille encore »), pas de notification ; noter `"<id>": "en-cours"`.
- **Pas de battement, la tâche a bien tourné, la session ne travaille plus** → **une** relance
  automatique : `fire_trigger` avec `text` = "Watchdog re-run: last night's run left no heartbeat
  in encrine-ai/agents/status — do the full run, then write the heartbeat." Jamais plus d'une
  relance par agent et par jour (lire `status/surveillance.json` → `reruns`, s'il est d'aujourd'hui).
  Notifier le propriétaire de la relance.
- **Tâche absente, désactivée ou suspendue, session archivée ou `failed`, ou battement en
  `result: error`** → pas de réparation soi-même au-delà de la relance unique : notifier le
  propriétaire (en français, mots simples) avec la cause et la réparation — d'ordinaire « ouvre une
  session sur encrine-ai/agents et tape /installer-agents » (DEPANNAGE.md).
- Un battement en `blocked` n'est pas une panne : l'agent attend quelque chose (un clic, un OK).
  Le rappeler dans la ligne du matin, sans notification.

## 4. Le battement de la surveillance elle-même

Écrire `status/surveillance.json` —

```json
{ "agent": "surveillance", "date": "<AAAA-MM-JJ Paris>", "checkedAt": "<ISO UTC>",
  "moteur": "<ok|nothing-new|blocked|missing|en-cours|error>", "galerie": "<…>",
  "reruns": ["moteur"], "notified": true }
```

— commit « Surveillance du <date> : <moteur>/<galerie> » (auteur `Claude <noreply@anthropic.com>`,
lignes `Co-Authored-By` et `Claude-Session` au bout), `git pull --rebase origin main`, puis
`git push origin main` (une nouvelle tentative si la poussée est refusée).

La vérification à la main (skill `verifier-agents`) suit les §1 et §2 seulement : elle ne relance
rien et n'écrit pas ce battement.
