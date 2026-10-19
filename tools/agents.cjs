#!/usr/bin/env node
/*
 * agents — lire et contrôler les définitions des agents de ce dépôt (agents/*.json + leurs consignes).
 *
 *   node tools/agents.cjs check            # chaque définition est complète ; les fichiers qu'elle nomme existent
 *   node tools/agents.cjs list             # id, heure, titre, procédure
 *   node tools/agents.cjs show <id>        # la définition entière + ses consignes complètes
 *   node tools/agents.cjs status           # le dernier battement de cœur de chaque agent (status/*.json)
 *   node tools/agents.cjs stub <id>        # l'amorce, le court texte que porte la tâche planifiée
 *
 * La tâche planifiée ne porte jamais les vraies consignes : elle porte une AMORCE qui met ce dépôt
 * à jour et lance agents/<id>.prompt.md. Changer ce que fait un agent = commit + push ici, rien à
 * réinstaller (le prompt d'une tâche ne se modifie que depuis sa propre session — règle de claude.ai).
 */
"use strict";
const fs = require("node:fs"), path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const DEPOT = "encrine-ai/agents";
const CLONE = "/home/user/agents";
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const ids = () => fs.readdirSync(path.join(ROOT, "agents")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const def = (id) => JSON.parse(rd(`agents/${id}.json`));

function stub(d) {
  const [owner, repo] = DEPOT.split("/");
  return [
    `Scheduled run of the Encrine "${d.id}" agent — this is the owner's scheduled job, carry it out in full.`,
    ``,
    `1. Make sure ${DEPOT} is cloned at ${CLONE} and up to date: if the folder is missing, call add_repo (owner "${owner}", repo "${repo}", access "push") and clone with the command it returns, into ${CLONE} (a fresh \`git clone\`, never a copy of another folder); otherwise \`git -C ${CLONE} pull --rebase origin main\` — if that fails (a heartbeat left unpushed, a conflict), move the folder aside (\`mv ${CLONE} ${CLONE}.old-$(date +%s)\`) and clone it fresh. Check that \`git -C ${CLONE} remote get-url origin\` points to ${DEPOT}.`,
    `2. Read ${CLONE}/${d.prompt} and do exactly what it says — it is your full instructions (they live in that repo so they can change without touching this scheduled task).`,
    `3. If step 1 fails, say so in French in your reply (« Agent ${d.id} : impossible de récupérer ${DEPOT} — <raison> ») and stop.`,
  ].join("\n");
}

function check() {
  const problems = [], notes = [];
  const all = ids();
  for (const id of all) {
    let d; try { d = def(id); } catch (e) { problems.push(`${id} : JSON invalide (${e.message})`); continue; }
    for (const k of ["id", "title", "schedule", "procedure", "workdir", "repos", "prompt"]) if (!d[k]) problems.push(`${id} : « ${k} » manque`);
    if (d.id !== id) problems.push(`${id} : id « ${d.id} » ≠ nom du fichier`);
    if (d.schedule && !/^CRON_TZ=[\w/]+ (\S+ ){4}\S+$/.test(d.schedule)) problems.push(`${id} : l'heure doit s'écrire « CRON_TZ=<zone> m h jdm mois jds »`);
    for (const f of [d.procedure, d.prompt]) if (f && !fs.existsSync(path.join(ROOT, f))) problems.push(`${id} : ${f} introuvable`);
    (d.repos || []).forEach((r) => { if (!/^[\w.-]+\/[\w.-]+$/.test(r.repo) || !["read", "push"].includes(r.access)) problems.push(`${id} : dépôt mal écrit ${JSON.stringify(r)}`); });
    if (!(d.repos || []).some((r) => r.repo === DEPOT && r.access === "push")) problems.push(`${id} : doit lister ${DEPOT} en push (procédures + battement de cœur)`);
    if (d.permissionMode && !["default", "acceptEdits", "auto", "dontAsk", "bypassPermissions"].includes(d.permissionMode)) problems.push(`${id} : permissionMode inconnu « ${d.permissionMode} »`);
    // ce qui casserait la première nuit : des consignes qui ne mènent pas à la procédure, ou une
    // procédure qui n'écrit pas son battement (la surveillance crierait chaque matin)
    if (d.prompt && d.procedure && fs.existsSync(path.join(ROOT, d.prompt))) {
      const p = rd(d.prompt);
      if (!p.includes(`${CLONE}/${d.procedure}`)) problems.push(`${id} : ${d.prompt} ne nomme pas ${CLONE}/${d.procedure}`);
      if (!p.includes(`${CLONE}/agents/${id}.json`) && !p.includes(DEPOT)) problems.push(`${id} : ${d.prompt} ne dit pas où prendre ses dépôts`);
    }
    if (d.procedure && fs.existsSync(path.join(ROOT, d.procedure)) && !rd(d.procedure).includes(`status/${id}.json`)) problems.push(`${id} : ${d.procedure} n'écrit pas status/${id}.json`);
    // les liens Markdown relatifs des procédures pointent vers des fichiers qui existent
    if (d.procedure && fs.existsSync(path.join(ROOT, d.procedure))) {
      for (const m of rd(d.procedure).matchAll(/\]\(([^)#:]+)\)/g)) {
        if (!fs.existsSync(path.join(ROOT, path.dirname(d.procedure), m[1]))) problems.push(`${id} : lien mort dans ${d.procedure} → ${m[1]}`);
      }
    }
  }
  const heures = {};
  for (const id of all) { try { const s = def(id).schedule; if (heures[s]) problems.push(`${id} et ${heures[s]} : même heure (${s})`); heures[s] = id; } catch (e) { /* déjà signalé */ } }
  let dep;
  try { dep = JSON.parse(rd("deployed.json")); } catch (e) { problems.push(`deployed.json : JSON invalide (${e.message})`); dep = { agents: {} }; }
  for (const id of all) {
    if (!(id in (dep.agents || {}))) { problems.push(`deployed.json : pas d'entrée pour « ${id} » (null tant qu'il n'est pas installé)`); continue; }
    const e = dep.agents[id];
    if (e === null) { notes.push(`${id} : pas encore installé (/installer-agents)`); continue; }
    if (!["stub", "complet"].includes(e.prompt)) problems.push(`deployed.json : ${id}.prompt doit valoir "stub" ou "complet"`);
    if (e.prompt === "complet") notes.push(`${id} : sa tâche porte encore les consignes complètes, pas l'amorce (/installer-agents la remplace)`);
  }
  for (const id of Object.keys(dep.agents || {})) if (!all.includes(id)) problems.push(`deployed.json : « ${id} » n'a pas de agents/${id}.json`);
  console.log(problems.length ? "PROBLÈMES :\n  - " + problems.join("\n  - ") : `agents OK (${all.join(", ")})`);
  if (notes.length) console.log("À noter :\n  - " + notes.join("\n  - "));
  process.exitCode = problems.length ? 1 : 0;
}

function usage(cmd) { console.error(`usage : ${cmd} <${ids().join("|")}>`); process.exit(2); }

const cmd = process.argv[2] || "list";
if (cmd === "check") check();
else if (cmd === "list") for (const id of ids()) { const d = def(id); console.log(`${id.padEnd(13)} ${d.schedule.padEnd(32)} ${d.title}  →  ${d.procedure}`); }
else if (cmd === "show") {
  const id = process.argv[3]; if (!id || !ids().includes(id)) usage("show");
  const d = def(id); console.log(JSON.stringify(d, null, 2)); console.log("\n----- CONSIGNES COMPLÈTES (agents/<id>.prompt.md, lues par l'amorce) -----\n" + rd(d.prompt).trim());
} else if (cmd === "status") {
  for (const id of ids()) {
    const f = path.join(ROOT, "status", id + ".json");
    if (!fs.existsSync(f)) { console.log(`${id.padEnd(13)} pas encore de battement de cœur`); continue; }
    let s; try { s = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.log(`${id.padEnd(13)} battement illisible (${e.message})`); continue; }
    const resultat = s.result || ["moteur", "galerie"].filter((k) => k in s).map((k) => `${k}:${s[k]}`).join(" ");
    const attente = (s.waitingForOwner || []).length ? `  — attend : ${s.waitingForOwner.join(" ; ")}` : "";
    console.log(`${id.padEnd(13)} ${s.date || "?"}  ${resultat}  ${s.summary || ""}${attente}`);
  }
} else if (cmd === "stub") {
  const id = process.argv[3]; if (!id || !ids().includes(id)) usage("stub");
  console.log(stub(def(id)));
} else { console.error("commandes : check | list | show <id> | status | stub <id>"); process.exit(2); }
