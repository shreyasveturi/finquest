import { prisma } from './prisma';

export type EventName =
  | 'cta_start_match_clicked'
  | 'queue_joined'
  | 'queue_matched'
  | 'match_started'
  | 'match_completed'
  | 'play_again_clicked'
  | 'auth_login_success'
  | 'round_completed'
  | 'user_left_queue'
  | 'bot_match_created'
  | string;

export async function trackEvent(
  eventName: EventName,
  properties?: Record<string, any>,
  userId?: string | null
): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        userId: userId || null,
        eventName,
        properties: properties ? JSON.stringify(properties) : null,
      },
    });
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
}
