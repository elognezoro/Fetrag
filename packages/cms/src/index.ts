// @fetrag/cms - Logique éditoriale : pages, actualités, ressources, services, partenaires, menus, SEO, formulaires.
// Chaque namespace expose list / getById / create / update / remove (permissions vérifiées côté serveur)
// ainsi que ses lecteurs publics (BUILD_BRIEF §2).

export * as pages from './pages'
export * as articles from './articles'
export * as categories from './categories'
export * as partners from './partners'
export * as services from './services'
export * as serviceRequests from './service-requests'
export * as resources from './resources'
export * as media from './media'
export * as menus from './menus'
export * as seo from './seo'
export * as forms from './forms'
export * as newsletter from './newsletter'
export * as faq from './faq'
export * as events from './events'
export * as revisions from './revisions'
export * as publishing from './publishing'

// Assainissement HTML et extraits (écriture et rendu).
export { sanitizeHtml, renderExcerpt, stripHtml, decodeEntities, sanitizeOptions, allowedTags, allowedIframeHostnames } from './sanitize'

// Schémas Zod d'entrée et types associés.
export * from './schemas'

// Helpers transverses utiles aux apps (CSV, contexte de requête, validation au bord).
export { toCsv, parseInput, adminListQuerySchema, publicListQuerySchema } from './common'
export type { RequestContext, AdminListQuery, PublicListQuery, CsvCell, Maybe } from './common'

// Types principaux réexportés à plat pour les composants serveur.
export type { PublicPage, PageDetail, PageListItem } from './pages'
export type { ArticleCard, ArticleDetail, ArticleListItem, PublicArticle } from './articles'
export type { CategoryWithCounts, CategoryKind } from './categories'
export type { PartnerKind } from './partners'
export type { ServiceCard, ServiceDetail, ServiceListItem, PublicService } from './services'
export type { ServiceRequestDetail, ServiceRequestListItem, ServiceRequestCreateResult } from './service-requests'
export type { PublicResource, ResourceCard, ResourceDetail, ResourceListItem, DownloadResult, AccessSubject } from './resources'
export type { MediaListItem } from './media'
export type { MenuTree, MenuTreeItem, MenuSummary } from './menus'
export type { SeoData, SeoEntity, SeoRecordLike, SiteMetadata } from './seo'
export type { SubmitResult, SubmitContext, FormSubmissionListItem } from './forms'
export type { SubscribeResult, SubscribeOptions, ConfirmResult, SubscriptionState, SubscriptionListItem } from './newsletter'
export type { EventCard, EventDetail, EventListItem, PublicEvent, RegisterResult, AttendeeRow, AttendeesExport } from './events'
export type { RevisionSummary, RevisionDetail, RevisionComparison } from './revisions'
export type { TransitionResult, TransitionOptions, PublishScheduledResult } from './publishing'
export type { OfferSummary } from './offers'
export type { UploadFile, UploadRules, SendEmailInput, NotifyInput } from './platform'
