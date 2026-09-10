import { Download } from 'lucide-react'
import { Button, Input, NativeSelect } from '@fetrag/ui'

/** Formulaire d'export CSV (GET sans JavaScript) : type de données et période. Composant serveur. */
export function FinanceExportForm({ action = '/admin/finance/exports' }: { action?: string }) {
  return (
    <form method="get" action={action} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="export-type" className="mb-1 block text-xs font-semibold text-neutral-600">
            Données
          </label>
          <NativeSelect
            id="export-type"
            name="type"
            defaultValue="commandes"
            options={[
              { value: 'commandes', label: 'Commandes' },
              { value: 'paiements', label: 'Paiements' },
            ]}
          />
        </div>
        <div>
          <label htmlFor="export-du" className="mb-1 block text-xs font-semibold text-neutral-600">
            Du
          </label>
          <Input id="export-du" name="du" type="date" />
        </div>
        <div>
          <label htmlFor="export-au" className="mb-1 block text-xs font-semibold text-neutral-600">
            Au
          </label>
          <Input id="export-au" name="au" type="date" />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">CSV UTF-8 (séparateur point-virgule), 5 000 lignes au plus ; chaque export est journalisé.</p>
        <Button type="submit" variant="outline" size="md" className="w-full sm:w-auto sm:shrink-0">
          <Download aria-hidden="true" />
          Exporter
        </Button>
      </div>
    </form>
  )
}
