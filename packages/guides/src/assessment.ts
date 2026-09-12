// La correction et le niveau de maîtrise sont des fonctions pures partagées : elles vivent dans @fetrag/contracts
// (utilisables par le lecteur côté client pour le retour immédiat, et par le serveur pour l'enregistrement).
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
} from '@fetrag/contracts'
