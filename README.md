# sanity-content-lint

`sanity-content-lint` is a CLI tool designed to act like ESLint but for your Sanity CMS content. It checks your published documents for missing fields, broken references, duplicate content, and more, ensuring your content architecture maintains high quality.

## Features

- **Automated Content Checks:** Run checks across your Sanity documents directly from the terminal.
- **Customizable Rules:** Configure which rules apply to which document types, and define their severity (`error` or `warning`).
- **Flexible Output:** Read beautifully formatted terminal output by default, or output valid JSON for CI/CD pipelines.
- **CI/CD Ready:** Exit codes reflect the severity of linting issues, perfect for failing builds when critical content is missing.

## Installation

You can install `sanity-content-lint` locally in your project or globally:

```bash
# Using npm
npm install --save-dev sanity-content-lint

# Using yarn
yarn add -D sanity-content-lint
```

## Environment Variables

Before running the CLI, you need to provide your Sanity credentials via environment variables. You can place these in a `.env` file in the root of your project:

```env
SANITY_PROJECT_ID=your-sanity-project-id
SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-api-token
```

> **Note:** The API Token should have at least "Viewer" permissions to read your datasets.

## Usage

If installed locally, you can run the linter using `npx`:

```bash
npx sanity-content-lint
```

### CLI Options

- `--format json` : Outputs the linting results as a valid JSON string (useful for programmatic parsing).
- `--no-color`    : Disables ANSI colors in the human-readable terminal output.

Example:
```bash
npx sanity-content-lint --format json
```

## Configuration

By default, the tool comes with a built-in configuration. However, you can override any setting by creating a `sanity-content-lint.config.json` file in the root of your directory. 

Here is an example configuration:

```json
{
  "rules": {
    "missingTitle": {
      "severity": "error",
      "documentTypes": ["post", "article"]
    },
    "missingRequiredFields": {
      "severity": "warning",
      "requiredFields": {
        "post": ["body", "author", "publishedAt"]
      }
    }
  }
}
```
Setting a severity to `"error"` means the CLI will exit with a non-zero code if the rule is violated, which is ideal for CI pipelines.

## Supported Rules

- **C001 – missingTitle:** Reports documents that have no title, an empty title, or a title made up only of whitespace.
- **C002 – missingSeoDescription:** Reports documents that are missing a valid SEO description field (configurable field path).
- **C003 – missingSlug:** Reports documents that lack a proper slug.
- **C004 – missingMainImage:** Reports documents that are missing a main image field.
- **C005 – brokenReferences:** Validates that all references point to actual existing documents.
- **C006 – duplicateContent:** Reports documents that have identical values for specific configured fields (like identical titles or slugs).
- **C007 – missingRequiredFields:** A flexible rule to define a list of fields that must be populated on a per-document-type basis.

## Development & Testing

To work on `sanity-content-lint` locally:

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Build the CLI:
   ```bash
   npm run build
   ```
3. Run the test suite:
   ```bash
   npm test
   ```

## License

This project is licensed under the MIT License.
