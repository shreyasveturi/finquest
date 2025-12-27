import { redirect } from 'next/navigation';
import { DEFAULT_LESSON_SLUG } from '@/data/lessons';

export default function LessonIndexPage() {
  redirect(`/lesson/${DEFAULT_LESSON_SLUG}`);
}
