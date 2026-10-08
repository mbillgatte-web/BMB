import { describe, it, expect } from "vitest";
import { extraireResumeEtHtml, lireJson } from "@/lib/gemini";

describe("extraireResumeEtHtml : lecture de la réponse de l'IA", () => {
  it("sépare le résumé et la page HTML", () => {
    const reponse = "RÉSUMÉ : Site vitrine sobre.\n<!DOCTYPE html><html><body>ok</body></html>";
    expect(extraireResumeEtHtml(reponse)).toEqual({
      resume: "Site vitrine sobre.",
      html: "<!DOCTYPE html><html><body>ok</body></html>",
    });
  });
  it("tolère les balises de code ajoutées par le modèle", () => {
    const reponse = "```html\n<html><body>x</body></html>\n```";
    expect(extraireResumeEtHtml(reponse)?.html).toBe("<html><body>x</body></html>");
  });
  it("renvoie null si la page est incomplète", () => {
    expect(extraireResumeEtHtml("<html><body>coupé")).toBeNull();
    expect(extraireResumeEtHtml("Je ne peux pas faire ça.")).toBeNull();
  });
});

describe("lireJson : réponse structurée de l'IA", () => {
  it("lit un JSON enveloppé dans des balises de code", () => {
    expect(lireJson<{ a: number }>("```json\n{\"a\":1}\n```")).toEqual({ a: 1 });
  });
  it("renvoie null si le JSON est invalide", () => {
    expect(lireJson("{pas du json")).toBeNull();
  });
});
