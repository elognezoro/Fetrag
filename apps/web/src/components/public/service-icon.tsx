import {
  Briefcase,
  ClipboardCheck,
  FileText,
  Gavel,
  Handshake,
  HeartHandshake,
  LifeBuoy,
  Scale,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

/** Correspondance entre le nom d'icône stocké dans `Service.icon` et l'icône lucide rendue. */
const icons: Record<string, LucideIcon> = {
  scale: Scale,
  users: Users,
  gavel: Gavel,
  'clipboard-check': ClipboardCheck,
  handshake: Handshake,
  'heart-handshake': HeartHandshake,
  briefcase: Briefcase,
  'file-text': FileText,
  'shield-check': ShieldCheck,
  'life-buoy': LifeBuoy,
}

export function serviceIcon(name: string | null | undefined): LucideIcon {
  if (!name) return LifeBuoy
  return icons[name.toLowerCase()] ?? LifeBuoy
}

interface ServiceIconProps {
  name: string | null | undefined
  className?: string
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  const Icon = serviceIcon(name)
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />
}
