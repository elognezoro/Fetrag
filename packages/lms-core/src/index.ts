// @fetrag/lms-core - Cœur LMS : catalogue, versions, inscriptions, progression, évaluations, devoirs, cohortes, présences, workflow institutionnel, certification.

export * as catalog from './catalog'
export * as courseBuilder from './courseBuilder'
export * as enrollments from './enrollments'
export * as progress from './progress'
export * as quizzes from './quizzes'
export * as questionBank from './questionBank'
export * as assignments from './assignments'
export * as cohorts from './cohorts'
export * as attendance from './attendance'
export * as trainingRequests from './trainingRequests'
export * as certification from './certification'
export * as forums from './forums'
export * as reports from './reports'
export * as dashboards from './dashboards'
export * as surveys from './surveys'

// Schémas de contenu et helpers de parsing tolérants
export {
  activityContentSchemas,
  questionConfigSchemas,
  parseActivityContent,
  readActivityContent,
  parseQuestionConfig,
  readQuestionConfig,
  countBlanks,
  lowBandwidthSchema,
} from './schemas'
export type { ActivityContent, ActivityContentMap, QuestionConfig, QuestionConfigMap, LowBandwidthAlternative } from './schemas'

// Correction automatique pure
export { gradeAnswer, computeAttemptTotals, expectedBoolean } from './grading'
export type { GradableQuestion, GradableOption, GradeResult, GradingOptions, AttemptTotals } from './grading'

// Schémas d'entrée du builder et des services
export {
  courseInputSchema,
  courseUpdateSchema,
  versionInputSchema,
  moduleInputSchema,
  lessonInputSchema,
  activityInputSchema,
  activityUpdateSchema,
  quizInputSchema,
  assignmentInputSchema,
  liveSessionInputSchema,
  reorderSchema,
  defaultCompletionRule,
} from './courseBuilder'
export type { CourseInput, CourseUpdateInput, VersionInput, ModuleInput, LessonInput, ActivityInput, ActivityUpdateInput, QuizInput, AssignmentInput, LiveSessionInput } from './courseBuilder'
export { questionInputSchema, questionOptionInputSchema, questionListQuerySchema, addToQuizSchema } from './questionBank'
export type { QuestionInput, QuestionOptionInput, QuestionListQuery } from './questionBank'
export { catalogQuerySchema } from './catalog'
export type { CatalogQuery } from './catalog'
export { enrollOptionsSchema, enrollmentTransitions } from './enrollments'
export type { EnrollOptions } from './enrollments'
export { gradeEssaySchema } from './quizzes'
export type { GradeEssayInput, SubmitAttemptInput, PresentedQuestion, PresentedOption } from './quizzes'
export { cohortInputSchema, cohortUpdateSchema, sessionInputSchema, cohortListQuerySchema } from './cohorts'
export type { CohortInput, SessionInput } from './cohorts'
export { attachmentInputSchema, trainingRequestListQuerySchema, pendingCoordinationStatuses } from './trainingRequests'
export type { AttachmentInput, TrainingRequestDecisionInput, ScheduleResult } from './trainingRequests'
export { certificateTemplateInputSchema, revokeInputSchema } from './certification'
export type { CertificateTemplateInput, EligibilityResult } from './certification'
export { forumInputSchema, threadInputSchema, replyInputSchema, moderationInputSchema } from './forums'
export type { ForumInput, ThreadInput, ReplyInput, ModerationInput } from './forums'
export type { ProgressSummary, ProgressState, NextActivity, ActivityProgressItem } from './progress'
export type { SurveyResults, QuestionAggregate, OptionAggregate } from './surveys'
export type { CsvColumn, CsvOptions, FinanceRange } from './reports'

// Helpers d'accès réutilisables par l'API et les apps
export { assertCan, assertOwnerOrCan, assertOrganizationAccess, scopedOrganizationFilter, visibleOrganizationIds, isStaff, isCoordination, requirePrincipal, auditContext } from './lib/access'
export { normalizeText, textEquals, displayName } from './lib/text'
export { trainingParticipantLimit, getSetting, settingKeys } from './lib/settings'
export type { Principal, RequestMeta, BulkResult } from './types'
