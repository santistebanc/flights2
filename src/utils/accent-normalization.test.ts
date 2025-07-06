import { normalizeTextForSearch, matchesSearchTerm } from "../utils";

describe("Accent Normalization", () => {
  describe("normalizeTextForSearch", () => {
    it("should remove accents from text", () => {
      expect(normalizeTextForSearch("Málaga")).toBe("malaga");
      expect(normalizeTextForSearch("São Paulo")).toBe("sao paulo");
      expect(normalizeTextForSearch("Zürich")).toBe("zurich");
      expect(normalizeTextForSearch("Montréal")).toBe("montreal");
      expect(normalizeTextForSearch("François")).toBe("francois");
    });

    it("should convert to lowercase", () => {
      expect(normalizeTextForSearch("MÁLAGA")).toBe("malaga");
      expect(normalizeTextForSearch("SÃO PAULO")).toBe("sao paulo");
    });

    it("should handle text without accents", () => {
      expect(normalizeTextForSearch("London")).toBe("london");
      expect(normalizeTextForSearch("New York")).toBe("new york");
    });

    it("should handle empty strings", () => {
      expect(normalizeTextForSearch("")).toBe("");
    });
  });

  describe("matchesSearchTerm", () => {
    it("should match accented text with non-accented search term", () => {
      expect(matchesSearchTerm("Málaga", "malaga")).toBe(true);
      expect(matchesSearchTerm("São Paulo", "sao paulo")).toBe(true);
      expect(matchesSearchTerm("Zürich", "zurich")).toBe(true);
    });

    it("should match non-accented text with accented search term", () => {
      expect(matchesSearchTerm("Malaga", "málaga")).toBe(true);
      expect(matchesSearchTerm("Sao Paulo", "são paulo")).toBe(true);
      expect(matchesSearchTerm("Zurich", "zürich")).toBe(true);
    });

    it("should match partial strings", () => {
      expect(matchesSearchTerm("Málaga Airport", "malaga")).toBe(true);
      expect(matchesSearchTerm("São Paulo International", "paulo")).toBe(true);
    });

    it("should be case insensitive", () => {
      expect(matchesSearchTerm("MÁLAGA", "malaga")).toBe(true);
      expect(matchesSearchTerm("málaga", "MALAGA")).toBe(true);
    });

    it("should not match unrelated text", () => {
      expect(matchesSearchTerm("London", "paris")).toBe(false);
      expect(matchesSearchTerm("Málaga", "barcelona")).toBe(false);
    });

    it("should handle complex accent combinations", () => {
      expect(matchesSearchTerm("Bogotá", "bogota")).toBe(true);
      expect(matchesSearchTerm("México", "mexico")).toBe(true);
      expect(matchesSearchTerm("Düsseldorf", "dusseldorf")).toBe(true);
      expect(matchesSearchTerm("Kraków", "krakow")).toBe(true);
      expect(matchesSearchTerm("Nicosia", "nicosia")).toBe(true);
    });

    it("should handle ligatures and special characters", () => {
      expect(matchesSearchTerm("Malmö", "malmo")).toBe(true);
      // Note: ø doesn't normalize to 'o' with NFD, it's a distinct character
      expect(matchesSearchTerm("Tromsø", "tromso")).toBe(false);
      expect(matchesSearchTerm("Tromsø", "tromsø")).toBe(true);
      // Note: ø doesn't normalize to 'o' with NFD
      expect(matchesSearchTerm("København", "kobenhavn")).toBe(false);
      expect(matchesSearchTerm("København", "københavn")).toBe(true);
    });
  });

  describe("Real-world airport examples", () => {
    it("should match common European airports", () => {
      // Spanish airports
      expect(matchesSearchTerm("Málaga-Costa del Sol", "malaga")).toBe(true);
      expect(matchesSearchTerm("A Coruña", "coruna")).toBe(true);

      // French airports
      expect(matchesSearchTerm("Côte d'Azur", "cote")).toBe(true);
      expect(matchesSearchTerm("Strasbourg", "strasbourg")).toBe(true);

      // German airports
      expect(matchesSearchTerm("Düsseldorf", "dusseldorf")).toBe(true);
      expect(matchesSearchTerm("München", "munchen")).toBe(true);

      // Scandinavian airports
      expect(matchesSearchTerm("Göteborg", "goteborg")).toBe(true);
      expect(matchesSearchTerm("Malmö", "malmo")).toBe(true);
    });

    it("should work bidirectionally", () => {
      // User types accented, finds non-accented
      expect(matchesSearchTerm("Malaga Airport", "málaga")).toBe(true);
      expect(matchesSearchTerm("Dusseldorf", "düsseldorf")).toBe(true);

      // User types non-accented, finds accented
      expect(matchesSearchTerm("Málaga Airport", "malaga")).toBe(true);
      expect(matchesSearchTerm("Düsseldorf", "dusseldorf")).toBe(true);
    });
  });
});
