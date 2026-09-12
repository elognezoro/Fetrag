// @fetrag/guides - guides d'utilisation par rôle (contenu structuré + politique d'accès).
// Le rendu (composants React) vit dans @fetrag/ui (`GuideReader`, `GuideCard`) ; les types dans @fetrag/contracts.

export { guides } from './catalog'
export { guideStats, toGuideMeta, type Guide, type GuideBlock, type GuideMeta, type GuidePlatform, type GuideRoleKey, type GuideSection, type GuideStep } from '@fetrag/contracts'
export { accessibleGuides, canReadGuide, commonGuide, guideById, guideForRole, guidePath, guidesOf, staffGuide } from './access'
export { defaultGuideBaseUrls, guideToMarkdown, resolveGuideUrls } from './markdown'
export { validateGuide, validateGuides, type GuideValidationIssue } from './validate'
export {
  answersSchema,
  assessmentMinutes,
  masteryLabels,
  masteryLevel,
  masteryMessages,
  scoreSelfAssessment,
  sectionIndex,
  type AssessmentResult,
  type GuideAnswers,
  type MasteryLevel,
  type QuestionResult,
  type SectionMastery,
} from './assessment'
// Les tentatives (base de données) s'importent depuis '@fetrag/guides/attempts' (serveur uniquement).
