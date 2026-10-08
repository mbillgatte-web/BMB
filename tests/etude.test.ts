import { describe, it, expect } from "vitest";
import { AXES_ETUDE, TOUTES_LES_QUESTIONS, etapeDeReprise } from "@/lib/questionsEtude";

describe("questionnaire de l'étude de faisabilité", () => {
  it("comporte 7 axes et 16 questions", () => {
    expect(AXES_ETUDE).toHaveLength(7);
    expect(TOUTES_LES_QUESTIONS.length).toBeGreaterThanOrEqual(16);
  });
  it("a des identifiants de question uniques", () => {
    const ids = TOUTES_LES_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("etapeDeReprise : reprise du questionnaire", () => {
  it("commence au premier axe quand rien n'est répondu", () => {
    expect(etapeDeReprise({})).toBe(0);
  });
  it("reprend au premier axe sans aucune réponse", () => {
    expect(etapeDeReprise({ "projet.idee": "Snack près du campus" })).toBe(1);
  });
  it("compte « Je ne sais pas » (null) comme un axe visité", () => {
    expect(etapeDeReprise({ "projet.idee": null, "marche.concurrents": null })).toBe(2);
  });
  it("renvoie l'écran récapitulatif quand tous les axes ont été vus", () => {
    const reponses = Object.fromEntries(AXES_ETUDE.map((a) => [a.questions[0].id, "x"]));
    expect(etapeDeReprise(reponses)).toBe(AXES_ETUDE.length);
  });
});
