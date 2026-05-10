import { FastifyInstance, preHandlerHookHandler } from "fastify";
import { GetEventAnalyticsUseCase } from "../../application/queries/get-event-analytics.use-case";
import { GetAnalyticsSummaryUseCase } from "../../application/queries/get-analytics-summary.use-case";
import { eventAnalyticsSchema } from "../dtos/analytics.dto";

export interface AnalyticsUseCases {
  getEventAnalyticsUseCase: GetEventAnalyticsUseCase;
  getAnalyticsSummaryUseCase: GetAnalyticsSummaryUseCase;
}

export interface AnalyticsRouteGuards {
  jwtGuard: preHandlerHookHandler;
  adminGuard: preHandlerHookHandler;
}

export function registerAnalyticsRoutes(
  app: FastifyInstance,
  useCases: AnalyticsUseCases,
  guards: AnalyticsRouteGuards,
): void {
  const { getEventAnalyticsUseCase, getAnalyticsSummaryUseCase } = useCases;
  const adminOnly = [guards.jwtGuard, guards.adminGuard];

  app.get("/analytics/summary", { preHandler: adminOnly }, async (req, reply) => {
    const summary = await getAnalyticsSummaryUseCase.execute();
    reply.send(summary);
  });

  app.get<{ Params: { eventId: string } }>(
    "/analytics/events/:eventId",
    { preHandler: adminOnly, schema: eventAnalyticsSchema },
    async (req, reply) => {
      const stat = await getEventAnalyticsUseCase.execute(Number(req.params.eventId));
      reply.send(stat);
    },
  );
}
