import { prisma } from './prisma';

export type EventName =
  | 'match_started'
  | 'round_completed'
  | 'match_finished'
  | 'user_joined_queue'
  | 'user_left_queue'
  | 'bot_match_created';

export async function trackEvent(
  userId: string,
  eventName: EventName,
  properties?: Record<string, any>
): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        userId,
        eventName,
        properties: properties ? JSON.stringify(properties) : null,
      },
    });
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
}
