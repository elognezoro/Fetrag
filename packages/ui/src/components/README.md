# Composants `@fetrag/ui` - « Le Cercle et l'Étoile »

Design system partagé par `apps/web` (site institutionnel) et `apps/lms` (formation). Tous les composants sont exportés depuis `@fetrag/ui` ; les styles globaux s'importent une fois par application (`import '@fetrag/ui/styles/globals.css'`).

Conventions :

- Export nommé, props typées, `className` fusionnée via `cn`. `forwardRef` sur les primitives de formulaire et les enveloppes Radix.
- Les composants marqués **client** commencent par `'use client'` (hooks, Radix, motion). Les autres sont compatibles Server Components.
- Aucun emoji ; icônes `lucide-react` (trait 1.75). Textes en français. Cibles tactiles de 44 px, focus visible, `prefers-reduced-motion` respecté.
- Tonalités : `Tone = 'blue' | 'green' | 'gold' | 'navy'`. Piliers (`PillarName` de contracts) : `protection` = bleu, `prevention` = vert, `defense` = or (`pillarTone`).
- Les libellés de statuts viennent de `@fetrag/contracts` via le pont `src/lib/contracts.ts` (à remplacer par un import direct dès que la dépendance est déclarée dans `package.json`).

## Primitives

| Composant | Mode | Props principales |
| --- | --- | --- |
| `Button` | serveur | `variant` = `primary \| secondary \| accent \| gold \| outline \| ghost \| link \| danger`, `size` = `sm \| md \| lg \| xl \| icon`, `asChild`, `loading`, `loadingLabel`, `leftIcon`, `rightIcon`. `type="button"` par défaut. `buttonVariants` (cva) exporté. |
| `IconButton` | serveur | `label` (obligatoire, aria-label), `icon` (LucideIcon) ou `children`, `size` = `sm \| md \| lg`, `variant` (défaut `ghost`). |
| `Badge` | serveur | `variant` = `blue \| green \| gold \| navy \| neutral \| success \| warning \| danger \| outline`, `size` = `sm \| md \| lg`, `dot`. |
| `StatusBadge` | serveur | `status` (enum brut, ex. `PUBLISHED`), `labels?` (surcharges), `variant?` (force la couleur). Mappage automatique couleur + libellé FR (`statusTone`, `statusLabel`). |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | serveur | `Card` : `pillar?` (filet supérieur 3 px), `interactive?` (survol relevé), `as?`. `CardTitle` : `as?` (`h2 \| h3 \| h4 \| div`). |
| `Input` | serveur | Attributs natifs + `invalid`, `leadingIcon` (LucideIcon), `trailing` (ReactNode). Hauteur 44 px. `fieldClassName` exporté pour les champs personnalisés. |
| `Textarea` | serveur | Attributs natifs + `invalid`, `resizable`, `rows` (défaut 4). |
| `NativeSelect` | serveur | Attributs natifs + `options?: { value, label, disabled? }[]`, `placeholder?`, `invalid`. Fonctionne sans JavaScript. |
| `Label` | client | Radix Label + `required` (astérisque et texte sr-only), `optional`. |
| `Checkbox` | client | Radix Checkbox + `invalid`. État `indeterminate` géré. |
| `RadioGroup`, `RadioGroupItem` | client | Radix RadioGroup ; `RadioGroupItem` accepte `invalid`. |
| `Switch` | client | Radix Switch + `size` = `sm \| md`. Vert à l'état actif. |
| `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel` | client | Radix Select ; `SelectTrigger` accepte `invalid` ; `SelectContent` en mode `popper` par défaut. |
| `FormField` | serveur | `label`, `htmlFor`, `error?` (string ou string[]), `hint?`, `required?`, `inline?` (case à cocher), `children`. Injecte `id`, `aria-describedby`, `aria-invalid`, `aria-required` sur l'enfant unique. |
| `FormMessage`, `FormDescription` | serveur | Message d'erreur (`role="alert"`, rien si vide) et texte d'aide. |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | client | Radix Tabs ; `TabsList` : `variant` = `pill \| underline`. |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | client | Radix Dialog ; `DialogContent` : `size` = `sm \| md \| lg \| xl \| full`, `hideClose`, `closeLabel`. |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup` | client | Radix Dropdown ; `DropdownMenuItem` : `inset`, `destructive`. |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | client | Radix Tooltip (fond marine). `TooltipProvider` à placer dans le layout racine. |
| `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor` | client | Radix Popover ; `PopoverContent` : `align`, `sideOffset`. |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | client | Radix Accordion (FAQ, détails de module). |
| `Avatar`, `AvatarImage`, `AvatarFallback` | client | Radix Avatar ; `Avatar` : `size` = `xs \| sm \| md \| lg \| xl`, `ring` (anneau bleu). Utiliser `initials(name)` pour le repli. |
| `Separator` | client | Radix Separator ; `orientation`, `decorative`, `label?` (texte centré). |
| `Progress` | client | Radix Progress ; `value` (0-100), `tone`, `size` = `sm \| md \| lg`, `showValue`, `label`. |
| `Skeleton` | serveur | `lines?` (plusieurs lignes), `circle?`. Utilise l'utilitaire `skeleton`. |
| `Alert`, `AlertTitle`, `AlertDescription` | serveur | `variant` = `info \| success \| warning \| danger`, `icon?` (LucideIcon ou `null`). `warning`/`danger` ont `role="alert"`. |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | serveur | `Table` : `wrapperClassName`, `bare`. Défilement horizontal intégré. |
| `Pagination` | serveur | `page`, `totalPages`, `hrefFor(page) => string` ou `onChange(page)`, `siblings?`, `label?`. Rien si une seule page. `paginationRange` exporté. |
| `EmptyState` | serveur | `icon?`, `title`, `description?`, `action?`, `compact?`. |
| `Breadcrumbs` | serveur | `items: BreadcrumbItem[]` (`{ label, href? }`), `homeHref?`, `inverted?`. |
| `Toaster`, `toast` | client | `Toaster` (sonner stylé) à monter une fois par app ; `toast.success(...)`, `toast.error(...)`. |

## Composants signatures (`brand/`)

| Composant | Mode | Props principales |
| --- | --- | --- |
| `Ribbon` | serveur | `tone` = `blue \| green \| gold \| navy`, `size` = `sm \| md \| lg`, `as`, `tilt`. Ruban à extrémités biseautées (`clip-path`), texte eyebrow. |
| `Emblem` | serveur | `size` (px), `variant` = `color \| mono \| white`, `title`, `decorative`. SVG vectoriel original : anneau bleu, arc vert ouvert en haut, étoile or, deux silhouettes bras levés. |
| `Logo` | client | `size` (px), `withText`, `href?`, `inverted`, `priority`. Image officielle `/brand/logo-fetrag.webp` via `next/image`, repli sur `Emblem` + texte. |
| `ArcRing` | client | `size`, `stroke`, `progress` (0-100), `tone`, `animate`, `track`, `duration`, `children` (centré). Arc de 270° ouvert en haut, tracé animé (`stroke-dashoffset`, motion). |
| `ProgressArc` | client | `value` (0-100), `label?`, `size?`, `stroke?`, `tone?` (auto : or < 50, vert, bleu à 100), `animate`. `role="progressbar"`. |
| `RingBackdrop` | serveur | `position` (`center`, `top-right`...), `rings`, `opacity` (0,04-0,08 recommandé), `arc`, `scheme` = `brand \| light`, `sizeClassName`. Parent en `relative`. |
| `SectionHeading` | serveur | `eyebrow?`, `title`, `description?`, `align` = `left \| center`, `tone?`, `as` = `h1 \| h2 \| h3`, `size` = `md \| lg \| xl`, `inverted`, `actions?`. |
| `PillarCard` | serveur | `index`, `title`, `description`, `icon?`, `pillar`, `href?`, `linkLabel?`. Filet coloré + grand chiffre serif. |
| `TriptychStrip` | serveur | `variant` = `cards \| inline \| bar`, `items?` (surcharges par pilier : `label`, `description`, `icon`), `inverted`. Libellés `pillarLabels` de contracts. |
| `ModuleCard` | serveur | `number` (`'01'`), `title`, `items: string[]`, `pillar`, `href?`, `duration?`, `badge?`, `itemIcon?`, `linkLabel?`. |
| `StatTile` | serveur (compteur client) | `value` (number ou string), `label`, `icon?`, `tone?`, `suffix?`, `prefix?`, `animate?`, `decimals?`, `description?`, `inverted`. |
| `CertificateSeal` | serveur | `size`, `label` (« Certificat »), `ringText?`, `variant` = `color \| mono`, `title`, `decorative`. Sceau circulaire bleu/or avec texte circulaire et étoile. |
| `MottoStrip` | serveur | `variant` = `ribbon \| inline`, `size`, `inverted`, `tilt`. « Travail · Efficacité · Solidarité ». |
| `GradientDivider` | serveur | `variant` = `line \| arc`, `align`, `width` = `sm \| md \| lg \| full`. |

## Mouvement (`motion/`, tous clients)

| Composant | Props principales |
| --- | --- |
| `Reveal` | `delay?`, `y?` (18), `once?` (true), `duration?` (0,7), `as?` (balise), `className?`. Opacité 0→1, translation, ease-out-expo. |
| `Stagger`, `StaggerItem` | `Stagger` : `stagger?` (0,07), `delay?`, `once?`, `as?`. `StaggerItem` : `y?`, `duration?`, `as?`. |
| `Counter` | `to`, `from?`, `duration?`, `suffix?`, `prefix?`, `decimals?`, `locale?` (fr-FR), `delay?`. Valeur finale exposée aux lecteurs d'écran. |
| `Marquee` | `speed?` (secondes par cycle), `pauseOnHover?`, `direction?`, `gapClassName?`, `fade?`, `label?`. Contenu dupliqué (copie `aria-hidden`), statique si mouvement réduit. |
| `HoverLift` | `lift?` (-2), `pressScale?`, `disabled?`, `as?`. |
| `PageTransition` | `className?`, `keyed?` (rejoue au changement de route). |
| `useReducedMotionSafe()` | Hook : `true` si l'utilisateur préfère réduire les animations (`false` côté serveur). `EASE_OUT_EXPO` exporté. |

## Mise en page (`layout/`)

| Composant | Mode | Props principales |
| --- | --- | --- |
| `Container` | serveur | `size` = `default \| wide \| narrow \| prose`, `as`. Applique `container-fetrag`. |
| `Section` | serveur | `variant` = `default \| muted \| white \| dark \| soft`, `padding` = `none \| sm \| md \| lg`, `as`, `container` (true), `containerSize`, `rings` (bool ou props de `RingBackdrop`), `bordered`. |
| `PageHeader` | serveur | `title`, `eyebrow?`, `description?`, `breadcrumbs?`, `homeHref?`, `actions?`, `meta?`, `tone?`, `variant` = `light \| dark`, `align`, `size` = `md \| lg`, `aside?`. Fond avec `RingBackdrop`. |
| `Prose` | serveur | `html?` (HTML déjà assaini, rendu via `dangerouslySetInnerHTML`) ou `children`, `as`, `size`. Applique `prose-fetrag`. |
| `AppShell` | client | Conteneur du tableau de bord (contexte du tiroir mobile). `useAppShell()` expose `{ open, setOpen, close }`. |
| `AppShellSidebar` | client | `brand?`, `footer?`, `children` (navigation), `label?`. `aside` fixe de 272 px sur `lg+`, tiroir Radix Dialog sur mobile. |
| `AppShellTopbar` | client | `title?`, `children?` (zone centrale), `actions?`, `user?` (slot utilisateur). Collante, bouton menu sur mobile. |
| `AppShellMain` | client | `size` = `default \| wide \| full`. `<main id="contenu" tabIndex={-1}>`. |
| `SidebarNav` | client | `items: SidebarNavItem[]` (`{ label, href, icon?, badge?, exact?, external?, disabled? }`), `title?`. État actif via `usePathname`, ferme le tiroir après navigation. |

Structure type d'un tableau de bord :

```tsx
<AppShell>
  <AppShellSidebar brand={<Logo href="/" size={36} />} footer={<UserCard />}>
    <SidebarNav title="Apprentissage" items={items} />
  </AppShellSidebar>
  <AppShellTopbar title="Tableau de bord" user={<UserMenu />} />
  <AppShellMain>{children}</AppShellMain>
</AppShell>
```

## i18n

- `fr` : dictionnaire (`common`, `nav`, `actions`, `status`, `errors`, `forms`, `pagination`, `table`, `empty`, `toast`, `dialog`, `motto`, `pillars`, `dashboard`, `time`, `a11y`).
- `t('nav.home')` : accès typé (`TranslationKey`), interpolation `{variable}` via le second argument.
- `statusLabel(status, overrides?)` : libellé FR d'un statut dynamique (repli sur la valeur brute).

## Utilitaires

- `cn(...)` : fusion de classes (clsx + tailwind-merge).
- `toneClasses`, `toneHex`, `pillarTone`, `resolveTone`, `toneAt` (`lib/tones`).
- `formatNumber`, `formatPercent`, `initials`, `padNumber`, `clamp` (`lib/format`).
