/**
 * Champ anti-robot (« pot de miel ») : invisible pour les visiteurs, masqué aux technologies
 * d'assistance et hors de l'ordre de tabulation. Les Server Actions traitent silencieusement
 * toute soumission où il est renseigné.
 */
export function HoneypotField({ id = 'website' }: { id?: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor={id}>Ne pas remplir ce champ</label>
      <input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  )
}
