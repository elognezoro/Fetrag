// Commerce : POST /checkout (Idempotency-Key obligatoire) et GET /orders/{id}.
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import { checkoutInputSchema, idSchema, orderStatuses, paymentMethodSchema, paymentStatusSchema } from '@fetrag/contracts'
import { createCheckout, orders } from '@fetrag/payments'
import { errorResponses, jsonContent, protectedErrors } from '../lib/responses'
import { authenticated, requirePrincipal } from '../middleware/auth'
import { idempotencyRequired, requireIdempotencyKey } from '../middleware/idempotency'
import { strictRateLimit } from '../middleware/rate-limit'
import { protectedSecurity } from '../openapi'
import { idParamSchema, isoDateSchema, nullableDateSchema } from '../schemas/common'

const checkoutBodySchema = checkoutInputSchema
  .omit({ idempotencyKey: true })
  .extend({
    idempotencyKey: z.string().min(8).max(120).optional().openapi({ description: 'Facultatif dans le corps : l’en-tête Idempotency-Key fait foi' }),
  })
  .openapi('CheckoutInput')

const checkoutResultSchema = z
  .object({
    orderId: idSchema,
    paymentId: idSchema,
    reference: z.string().openapi({ example: 'CMD-2026-7K2P9Q' }),
    status: z.enum(orderStatuses),
    totalAmount: z.number().int().openapi({ description: 'Montant entier en XAF' }),
    currency: z.string(),
    nextAction: z.object({
      type: z.enum(['redirect', 'instructions', 'none']),
      url: z.string().optional(),
      message: z.string().optional(),
    }),
  })
  .openapi('CheckoutResult')

const checkoutRoute = createRoute({
  method: 'post',
  path: '/checkout',
  tags: ['Paiements'],
  summary: 'Créer une commande et initier le paiement',
  description:
    'Offre vendable, coupon, prise en charge, totaux entiers XAF. L’en-tête `Idempotency-Key` (8 à 120 caractères) est obligatoire : ' +
    'une même clé renvoie la même commande. Le PSP configuré (sandbox, Airtel Money, Moov Money) fournit l’action suivante.',
  security: protectedSecurity,
  middleware: [authenticated, strictRateLimit, idempotencyRequired],
  request: { body: { content: { 'application/json': { schema: checkoutBodySchema } }, required: true } },
  responses: {
    201: jsonContent(checkoutResultSchema, 'Commande créée'),
    ...protectedErrors(),
    ...errorResponses(409, 412, 428),
  },
})

const refundSchema = z.object({
  id: idSchema,
  amount: z.number().int(),
  reason: z.string().nullable(),
  status: z.enum(['REQUESTED', 'APPROVED', 'PROCESSED', 'REJECTED']),
  processedAt: nullableDateSchema,
  createdAt: isoDateSchema,
})

const orderDetailSchema = z
  .object({
    id: idSchema,
    reference: z.string(),
    status: z.enum(orderStatuses),
    subtotalAmount: z.number().int(),
    discountAmount: z.number().int(),
    totalAmount: z.number().int(),
    currency: z.string(),
    note: z.string().nullable(),
    paidAt: nullableDateSchema,
    createdAt: isoDateSchema,
    updatedAt: isoDateSchema,
    user: z.object({ id: idSchema, email: z.string(), name: z.string().nullable(), firstName: z.string().nullable(), lastName: z.string().nullable() }),
    organization: z.object({ id: idSchema, name: z.string() }).nullable(),
    coupon: z.object({ code: z.string(), type: z.enum(['PERCENT', 'FIXED']), value: z.number().int() }).nullable(),
    sponsorship: z.object({ label: z.string(), percent: z.number().int() }).nullable(),
    lines: z.array(
      z.object({
        id: idSchema,
        label: z.string(),
        quantity: z.number().int(),
        unitAmount: z.number().int(),
        totalAmount: z.number().int(),
        offer: z
          .object({
            id: idSchema,
            kind: z.enum(['COURSE', 'EVENT', 'SERVICE', 'RESOURCE']),
            courseId: z.string().nullable(),
            eventId: z.string().nullable(),
            serviceId: z.string().nullable(),
            resourceId: z.string().nullable(),
          })
          .nullable(),
      }),
    ),
    payments: z.array(
      z.object({
        id: idSchema,
        provider: z.string(),
        providerRef: z.string().nullable(),
        method: paymentMethodSchema,
        status: paymentStatusSchema,
        amount: z.number().int(),
        currency: z.string(),
        failureReason: z.string().nullable(),
        confirmedAt: nullableDateSchema,
        createdAt: isoDateSchema,
        refunds: z.array(refundSchema),
      }),
    ),
    receipt: z.object({ id: idSchema, number: z.string(), pdfUrl: z.string().nullable(), issuedAt: isoDateSchema }).nullable(),
    history: z.array(z.object({ id: idSchema, fromStatus: z.string().nullable(), toStatus: z.string(), comment: z.string().nullable(), createdAt: isoDateSchema })),
    enrollments: z.array(z.object({ id: idSchema, courseId: idSchema, status: z.string() })),
    eventRegistrations: z.array(z.object({ id: idSchema, eventId: idSchema, status: z.string() })),
    serviceRequest: z.object({ id: idSchema, reference: z.string(), status: z.string() }).nullable(),
  })
  .openapi('OrderDetail')

const orderRoute = createRoute({
  method: 'get',
  path: '/orders/{id}',
  tags: ['Paiements'],
  summary: 'Détail d’une commande',
  description: 'Propriétaire de la commande ou permission `finance.read`.',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { params: idParamSchema },
  responses: { 200: jsonContent(orderDetailSchema, 'Commande'), ...protectedErrors() },
})

export const commerceRoutes = createRouter()

commerceRoutes.openapi(checkoutRoute, async (c) => {
  const principal = requirePrincipal(c)
  const body = c.req.valid('json')
  const idempotencyKey = requireIdempotencyKey(c)
  const result = await createCheckout(principal, { ...body, idempotencyKey })
  c.header('Cache-Control', 'no-store')
  return c.json(result, 201)
})

commerceRoutes.openapi(orderRoute, async (c) => {
  const principal = requirePrincipal(c)
  const { id } = c.req.valid('param')
  const order = await orders.get(principal, id)
  c.header('Cache-Control', 'private, no-store')
  return c.json(
    {
      id: order.id,
      reference: order.reference,
      status: order.status,
      subtotalAmount: order.subtotalAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      currency: order.currency,
      note: order.note,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: { id: order.user.id, email: order.user.email, name: order.user.name, firstName: order.user.firstName, lastName: order.user.lastName },
      organization: order.organization,
      coupon: order.coupon,
      sponsorship: order.sponsorship,
      lines: order.lines.map((line) => ({
        id: line.id,
        label: line.label,
        quantity: line.quantity,
        unitAmount: line.unitAmount,
        totalAmount: line.totalAmount,
        offer: line.offer,
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        provider: payment.provider,
        providerRef: payment.providerRef,
        method: payment.method,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        failureReason: payment.failureReason,
        confirmedAt: payment.confirmedAt,
        createdAt: payment.createdAt,
        refunds: payment.refunds.map((refund) => ({
          id: refund.id,
          amount: refund.amount,
          reason: refund.reason,
          status: refund.status,
          processedAt: refund.processedAt,
          createdAt: refund.createdAt,
        })),
      })),
      receipt: order.receipt ? { id: order.receipt.id, number: order.receipt.number, pdfUrl: order.receipt.pdfUrl, issuedAt: order.receipt.issuedAt } : null,
      history: order.history.map((event) => ({ id: event.id, fromStatus: event.fromStatus, toStatus: event.toStatus, comment: event.comment, createdAt: event.createdAt })),
      enrollments: order.enrollments,
      eventRegistrations: order.eventRegistrations,
      serviceRequest: order.serviceRequest,
    },
    200,
  )
})
