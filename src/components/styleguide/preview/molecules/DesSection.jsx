/**
 * DesSection
 *
 * Standardized header for major component sections (top-level)
 * Displays section name, description, and optional code snippet/details
 *
 * Typography:
 * - name: kol-heading-sm (large heading for section-level hierarchy)
 * - description: kol-mono-xs
 * - details/code: kol-mono-xxs with opacity-60
 *
 * @param {string} name - Section name (e.g., "Glyph Item", "Feature Card")
 * @param {string} description - Brief description of the section
 * @param {string} details - Additional technical details (optional)
 * @param {string} code - Code snippet example (optional)
 * @param {ReactNode} children - Content to render below the header
 */
const DesSection = ({ name, description, details, code }) => {
  return (
    <div className="space-y-2 mb-16 w-[50%]">
      <h3 className="kol-heading-sm">{name}</h3>

      <p className="kol-mono-xs">{description}</p>

      {details && (
        <p className="kol-mono-xxs opacity-60">{details}</p>
      )}

      {code && (
        <code className="block kol-mono-xxs opacity-60 mt-2">{code}</code>
      )}
    </div>
  )
}

export default DesSection
