import { Hash, ShieldCheck } from 'lucide-react'
import { Button, FormField, Input, cn } from '@fetrag/ui'

interface CertificateVerifyFormProps {
  /** Code pré-rempli (nouvelle vérification depuis une page de résultat). */
  defaultCode?: string
  error?: string
  compact?: boolean
  className?: string
}

/**
 * Formulaire de vérification d'un certificat (GET, sans JavaScript) : le code ou le numéro saisi
 * est normalisé côté serveur puis la page de résultat /certificats/verifier/[code] est affichée.
 */
export function CertificateVerifyForm({ defaultCode, error, compact = false, className }: CertificateVerifyFormProps) {
  return (
    <form action="/certificats/verifier" method="get" className={cn('flex flex-col gap-4', className)}>
      <FormField
        label="Code de vérification ou numéro du certificat"
        htmlFor="certificate-code"
        error={error}
        hint={compact ? undefined : 'Le code figure sous le QR code du document (ex. ABCD-EFGH-IJKL) ; le numéro commence par FETRAG-.'}
        required
      >
        <Input
          name="code"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          leadingIcon={Hash}
          defaultValue={defaultCode}
          placeholder="ABCD-EFGH-IJKL ou FETRAG-2026-000123"
          minLength={4}
          maxLength={40}
          pattern="[A-Za-z0-9\-\s]{4,40}"
          className="font-mono uppercase"
          required
        />
      </FormField>
      <div>
        <Button type="submit" variant="primary" size={compact ? 'md' : 'lg'} leftIcon={<ShieldCheck aria-hidden="true" />}>
          Vérifier l&apos;authenticité
        </Button>
      </div>
    </form>
  )
}
