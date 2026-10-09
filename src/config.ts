
/**
 * Central configuration for sanity-content-lint.
 *
 * Each key under `rules` maps directly to a lint rule.
 * Change `severity` to "error" to make the CLI exit with a
 * non-zero code when that rule fires (useful in CI pipelines).
 * Add or remove document type names in `documentTypes` to
 * control which Sanity schema types each rule inspects.
 */
export const config = {
  rules: {
    /**
     * C001 – Missing Title
     * Reports documents that have no title, an empty title,
     * or a title made up only of whitespace characters.
     */
    missingTitle: {
      severity: "warning" as const,
      documentTypes: ["post", "article", "page"],
    },

    /**
     * C002 – Missing SEO Description
     * Reports documents that have no SEO description, an empty description,
     * or a description made up only of whitespace characters.
     */
    missingSeoDescription: {
      severity: "warning" as const,
      documentTypes: ["post", "article", "page"],
      fieldPath: "seo.metaDescription", // can also be 'metaDescription' etc.
    },

    /**
     * C003 – Missing Slug
     * Reports documents that have no slug, an empty slug,
     * or a slug made up only of whitespace characters.
     */
    missingSlug: {
      severity: "warning" as const,
      documentTypes: ["post", "article", "page"],
    },

    /**
     * C004 – Missing Main Image
     * Reports documents that are missing a main image field.
     */
    missingMainImage: {
      severity: "warning" as const,
      documentTypes: ["article"], // Removed 'post' as it doesn't use main images in this project
      fieldPath: "mainImage",
    },

    /**
     * C005 – Broken References
     * Reports references pointing to documents that do not exist.
     */
    brokenReferences: {
      severity: "warning" as const,
      documentTypes: ["post", "article", "page"],
    },

    /**
     * C006 – Duplicate Content
     * Reports documents that have identical values for configured fields (e.g., titles or slugs).
     */
    duplicateContent: {
      severity: "warning" as const,
      documentTypes: ["post", "article", "page"],
      fields: ["title", "slug.current"],
    },

    /**
     * C007 – Missing Required Fields
     * Reports documents missing specific configured fields per document type.
     * To avoid duplicating C001, C002, C003, and C004 findings, do not configure
     * 'title', 'slug.current', 'seo.metaDescription', or 'mainImage' here. 
     * Use those dedicated rules instead for better error messages.
     */
    missingRequiredFields: {
      severity: "warning" as const,
      requiredFields: {
        post: ["body", "author", "publishedAt"],
        author: ["bio", "avatar"],
      },
    },
  },
};