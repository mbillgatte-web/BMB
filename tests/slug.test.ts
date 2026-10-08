import { describe, it, expect } from "vitest";
import { slugifier, genererSlug } from "@/data/site";

describe("slugifier : adresse publique d'un site", () => {
  it("transforme un nom d'entreprise en slug d'URL", () => {
    expect(slugifier("Chez Mamá & Fils")).toBe("chez-mama-fils");
  });
  it("retire les accents et les caractères spéciaux", () => {
    expect(slugifier("Épicerie N°1 à Douala !")).toBe("epicerie-n-1-a-douala");
  });
  it("renvoie un slug de secours si le nom est vide", () => {
    expect(slugifier("")).toBe("mon-site");
  });
  it("allonge un slug trop court", () => {
    expect(slugifier("AB").length).toBeGreaterThanOrEqual(3);
  });
});

describe("genererSlug : unicité des adresses", () => {
  it("garde le slug de base s'il est libre", () => {
    expect(genererSlug("V Group", [])).toBe("v-group");
  });
  it("ajoute un suffixe numérique en cas de collision", () => {
    expect(genererSlug("V Group", ["v-group"])).toBe("v-group-2");
    expect(genererSlug("V Group", ["v-group", "v-group-2"])).toBe("v-group-3");
  });
});
