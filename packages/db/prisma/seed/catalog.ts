import { ActivityType, CompletionRule, ContentStatus } from '@prisma/client'
import { prisma } from '../../src/client'
import { COURSE_SUBTITLE, courses, pillarColor, type CourseContent } from './course-content'
import { fixedDate, json, log, stableId } from './helpers'
import type { SeededUsers } from './users'

export interface SeededCategory {
  id: string
  slug: string
  name: string
}

export interface SeededLesson {
  id: string
  slug: string
  title: string
  position: number
  /** Activité TEXT principale de la leçon. */
  textActivityId: string
}

export interface SeededModule {
  id: string
  title: string
  position: number
  lessons: SeededLesson[]
}

export interface SeededCourse {
  id: string
  code: string
  slug: string
  title: string
  versionId: string
  isFree: boolean
  priceAmount: number | null
  memberPriceAmount: number | null
  modules: SeededModule[]
}

export interface SeededCatalog {
  categories: Record<string, SeededCategory>
  courses: Record<string, SeededCourse>
}

interface CategorySeed {
  slug: string
  name: string
  kind: 'article' | 'resource' | 'course'
  color: string | null
  position: number
  description: string
}

const categories: CategorySeed[] = [
  { slug: 'communiques', name: 'Communiqués', kind: 'article', color: '#0259C7', position: 1, description: 'Prises de position officielles de la Fédération.' },
  { slug: 'dialogue-social', name: 'Dialogue social', kind: 'article', color: '#9CC102', position: 2, description: 'Négociations, concertations et relations avec les partenaires sociaux.' },
  { slug: 'vie-de-la-federation', name: 'Vie de la fédération', kind: 'article', color: '#F9C804', position: 3, description: 'Assemblées, sections, mobilisations et actualité interne.' },
  { slug: 'formation', name: 'Formation', kind: 'article', color: '#042768', position: 4, description: 'Programme de formation, sessions et témoignages.' },
  { slug: 'juridique', name: 'Juridique', kind: 'article', color: '#0B1B3F', position: 5, description: 'Décryptages des textes et de la jurisprudence du travail.' },
  { slug: 'textes-juridiques', name: 'Textes juridiques', kind: 'resource', color: '#0259C7', position: 1, description: 'Lois, décrets, conventions internationales et collectives.' },
  { slug: 'guides-pratiques', name: 'Guides pratiques', kind: 'resource', color: '#9CC102', position: 2, description: 'Fiches et guides opérationnels pour les responsables syndicaux.' },
  { slug: 'rapports', name: 'Rapports', kind: 'resource', color: '#F9C804', position: 3, description: 'Rapports d’activité, études et analyses.' },
  { slug: 'formulaires', name: 'Formulaires', kind: 'resource', color: '#042768', position: 4, description: 'Modèles et formulaires à télécharger.' },
  { slug: 'programme-leaders-syndicaux', name: 'Programme Leaders Syndicaux', kind: 'course', color: '#0259C7', position: 1, description: 'Les 10 modules du Programme de formation des Leaders Syndicaux - Session 2026.' },
]

/** Crée ou met à jour les catégories (clé naturelle : slug). */
async function seedCategories(): Promise<Record<string, SeededCategory>> {
  const result: Record<string, SeededCategory> = {}
  for (const c of categories) {
    const data = { name: c.name, kind: c.kind, color: c.color, position: c.position, description: c.description }
    const saved = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { id: stableId('category', c.slug), slug: c.slug, ...data },
      update: data,
      select: { id: true, slug: true, name: true },
    })
    result[saved.slug] = saved
  }
  log.done(`${categories.length} catégories`)
  return result
}

/**
 * Crée un cours, sa version 1 publiée, ses modules, leçons et activités TEXT.
 * Les modules et activités n'ont pas de clé naturelle : identifiants stables.
 */
async function seedCourse(content: CourseContent, categoryId: string, users: SeededUsers): Promise<SeededCourse> {
  const publishedAt = fixedDate(2026, 1, 15)
  const courseData = {
    title: content.title,
    subtitle: COURSE_SUBTITLE,
    summary: content.summary,
    description: content.description,
    objectives: content.objectives,
    prerequisitesText: content.prerequisitesText,
    audience: content.audience,
    categoryId,
    modality: 'HYBRID' as const,
    level: content.level,
    language: 'fr' as const,
    durationHours: content.durationHours,
    pillar: content.pillar,
    color: pillarColor(content.pillar),
    enrollmentPolicy: content.enrollmentPolicy,
    isFree: content.isFree,
    priceAmount: content.priceAmount,
    memberPriceAmount: content.memberPriceAmount,
    currency: 'XAF',
    capacity: 25,
    status: ContentStatus.PUBLISHED,
    isFeatured: content.isFeatured,
    position: content.position,
    publishedAt,
    createdById: users.coordination.id,
  }

  const course = await prisma.course.upsert({
    where: { code: content.code },
    create: { id: stableId('course', content.code), code: content.code, slug: content.slug, ...courseData },
    update: { slug: content.slug, ...courseData },
    select: { id: true, code: true, slug: true, title: true },
  })

  const version = await prisma.courseVersion.upsert({
    where: { courseId_version: { courseId: course.id, version: 1 } },
    create: {
      id: stableId('course-version', content.code, 1),
      courseId: course.id,
      version: 1,
      label: 'Version initiale - Session 2026',
      changelog: 'Création du module à partir du Programme de formation des Leaders Syndicaux 2026.',
      isPublished: true,
      publishedAt,
      completionRules: json({ requireAllActivities: true, requiredActivityIds: [], passScore: 60, minAttendanceRate: 0 }),
    },
    update: {
      isPublished: true,
      publishedAt,
      completionRules: json({ requireAllActivities: true, requiredActivityIds: [], passScore: 60, minAttendanceRate: 0 }),
    },
    select: { id: true },
  })

  await prisma.course.update({ where: { id: course.id }, data: { currentVersionId: version.id } })

  await prisma.courseTrainer.upsert({
    where: { courseId_userId: { courseId: course.id, userId: users.formateur.id } },
    create: { courseId: course.id, userId: users.formateur.id, isLead: true },
    update: { isLead: true },
  })

  await prisma.seoRecord.upsert({
    where: { courseId: course.id },
    create: {
      id: stableId('seo-course', content.code),
      courseId: course.id,
      title: `${content.title} - Formation FETRAG`,
      description: content.summary.slice(0, 160),
    },
    update: { title: `${content.title} - Formation FETRAG`, description: content.summary.slice(0, 160) },
  })

  const modules: SeededModule[] = []
  for (const [moduleIndex, moduleContent] of content.modules.entries()) {
    const modulePosition = moduleIndex + 1
    const moduleId = stableId('course-module', content.code, modulePosition)
    const moduleData = {
      title: moduleContent.title,
      summary: moduleContent.summary,
      position: modulePosition,
      durationMinutes: moduleContent.durationMinutes,
      isOptional: false,
    }
    await prisma.courseModule.upsert({
      where: { id: moduleId },
      create: { id: moduleId, courseVersionId: version.id, ...moduleData },
      update: moduleData,
    })

    const lessons: SeededLesson[] = []
    for (const [lessonIndex, lessonContent] of moduleContent.lessons.entries()) {
      const lessonPosition = lessonIndex + 1
      const lessonData = {
        title: lessonContent.title,
        summary: lessonContent.summary,
        position: lessonPosition,
        durationMinutes: lessonContent.durationMinutes,
        isPreview: lessonContent.isPreview ?? false,
      }
      const lesson = await prisma.lesson.upsert({
        where: { moduleId_slug: { moduleId, slug: lessonContent.slug } },
        create: { id: stableId('lesson', content.code, lessonContent.slug), moduleId, slug: lessonContent.slug, ...lessonData },
        update: lessonData,
        select: { id: true, slug: true, title: true },
      })

      const textActivityId = stableId('activity', content.code, lessonContent.slug, 'text')
      const textActivity = {
        type: ActivityType.TEXT,
        title: lessonContent.title,
        instructions: 'Lisez attentivement le contenu ci-dessous puis passez à l’activité suivante.',
        content: json({ html: lessonContent.html }),
        position: 1,
        durationMinutes: Math.max(15, Math.round(lessonContent.durationMinutes / 2)),
        isRequired: true,
        completionRule: CompletionRule.VIEW,
        weight: 1,
      }
      await prisma.activity.upsert({
        where: { id: textActivityId },
        create: { id: textActivityId, lessonId: lesson.id, ...textActivity },
        update: textActivity,
      })

      lessons.push({ id: lesson.id, slug: lesson.slug, title: lesson.title, position: lessonPosition, textActivityId })
    }
    modules.push({ id: moduleId, title: moduleContent.title, position: modulePosition, lessons })
  }

  return {
    id: course.id,
    code: course.code,
    slug: course.slug,
    title: course.title,
    versionId: version.id,
    isFree: content.isFree,
    priceAmount: content.priceAmount,
    memberPriceAmount: content.memberPriceAmount,
    modules,
  }
}

/**
 * Charge les catégories et les 10 modules du programme (Course + CourseVersion v1 publiée +
 * 3 CourseModule + leçons + activité TEXT par leçon).
 */
export async function seedCatalog(users: SeededUsers): Promise<SeededCatalog> {
  log.step('Catalogue : catégories et 10 modules du programme 2026')
  const seededCategories = await seedCategories()
  const courseCategory = seededCategories['programme-leaders-syndicaux']
  if (!courseCategory) throw new Error('Seed : catégorie du programme introuvable')

  const seededCourses: Record<string, SeededCourse> = {}
  for (const content of courses) {
    const course = await seedCourse(content, courseCategory.id, users)
    seededCourses[course.code] = course
    const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0)
    log.info(`${course.code} ${course.title} : ${course.modules.length} modules, ${lessonCount} leçons`)
  }
  log.done(`${courses.length} cours publiés`)

  return { categories: seededCategories, courses: seededCourses }
}
