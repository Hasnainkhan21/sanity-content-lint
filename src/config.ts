
export const config = {
  rules: {
    missingSlug: {
      severity: "warning" as const,
      documentTypes: ["post", "article", "page"],
    },
  },
};