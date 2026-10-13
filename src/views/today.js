import { essentialsLink } from "./essentials.js";
import { pendingAnalysisCard } from "../play/analysis-task.js";
import { sessionPlan } from "../learn/session.js";
import { courseFor, nextDailyEntry } from "../learn/daily-courses.js";
import { dueCards } from "../learn/srs.js";
import { dateKey, esc } from "../ui/helpers.js";
export function dailyCourseCard(entries,state) {
  const saved=state.session?.day===dateKey()&&state.session.version===3?state.session:null;
  const s=saved || sessionPlan(state,entries), t=s.tasks.find(t=>t.kind==='lesson'), entry=entries.find(e=>e.id===t.entryId), c=courseFor(entry), next=nextDailyEntry(state,entries);
  const done=!!s.done, started=!!saved;
  return `<section class="session-card daily-course"><div class="session-kicker"><span class="eyebrow">${done?'COURS DU JOUR TERMINÉ':'TON COURS DU JOUR'}</span><span class="pill">${done?'ENREGISTRÉ ✓':started?'EN COURS':'EXPLICATION AVANT PRATIQUE'}</span></div><h2>${esc(c.goal)}</h2>${done?"":`<a class="button primary" href="#session">${started?'Reprendre mon cours':'Commencer ma leçon'} →</a>`}<p>${esc(c.why)}</p>${done?`<p>Tu as terminé « ${esc(entry.title)} ». Les exercices de révision restent disponibles ; demain, le parcours passe à la suite.</p><a class="button primary" href="#lesson/${esc(next.id)}">Apprendre encore : ${esc(next.title)} →</a>`:`<ol class="daily-list"><li><span>01</span><strong>Le cours expliqué<small>Le pourquoi, la méthode et les exemples sur l’échiquier</small></strong></li><li><span>02</span><strong>Un quiz pour comprendre<small>Chaque réponse est expliquée</small></strong></li><li><span>03</span><strong>À toi d’essayer<small>Exercices guidés, puis ${t.count || 6} problèmes de cette leçon</small></strong></li>${s.tasks.some(t=>t.kind==='reviews')?'<li><span>04</span><strong>Un rappel de tes anciennes erreurs</strong></li>':''}</ol><small>Environ ${s.minutes} minutes, à ton rythme. Tu peux quitter et reprendre.</small>`}</section>`;
}
export function dailyView(entries,state) {
  return `<header class="page-intro"><span class="eyebrow">APPRENDRE UN PEU, CHAQUE JOUR</span><h1>Une idée à comprendre.<br>Un réflexe à garder.</h1><p>D’abord le cours avec ses exemples. Ensuite seulement, le quiz et les exercices.</p></header>${dailyCourseCard(entries,state)}${pendingAnalysisCard(state)}${essentialsLink()}<div class="section-title"><h2>En complément</h2><a href="#catalogue">Tous mes cours ↗</a></div><p>${dueCards(state).length} révisions disponibles. Ton niveau en problèmes : ${state.ratings.global.value} ; ce score aide à choisir les exercices.</p><div class="course-extras"><a class="button secondary" href="#train/import">Comprendre une de mes parties →</a><a class="button secondary" href="#train">Pratiquer librement →</a></div>`;
}
