import { TriptychStrip, cn, type TriptychStripProps } from '@fetrag/ui'

type TriptychBarProps = Omit<TriptychStripProps, 'variant'>

/**
 * Barre tricolore du triptyque fondateur (variante `bar` du design system) adaptée au mobile :
 * en dessous de 640 px, les trois segments s'empilent et les libellés ne sont plus tronqués ;
 * à partir de `sm`, la barre horizontale d'origine est restituée telle quelle.
 */
export function TriptychBar({ className, ...props }: TriptychBarProps) {
  return (
    <TriptychStrip
      variant="bar"
      className={cn(
        'rounded-2xl sm:rounded-full',
        '[&>ol]:grid-cols-1 sm:[&>ol]:grid-cols-3',
        '[&_.truncate]:whitespace-normal sm:[&_.truncate]:whitespace-nowrap',
        className,
      )}
      {...props}
    />
  )
}
