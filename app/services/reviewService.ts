import { eq, and, avg, count, inArray } from "drizzle-orm";
import { db } from "~/db";
import { courseReviews } from "~/db/schema";

export function upsertCourseReview(
  userId: number,
  courseId: number,
  rating: number
) {
  const now = new Date().toISOString();
  db.insert(courseReviews)
    .values({ userId, courseId, rating, updatedAt: now })
    .onConflictDoUpdate({
      target: [courseReviews.userId, courseReviews.courseId],
      set: { rating, updatedAt: now },
    })
    .run();
}

export function getCourseReview(userId: number, courseId: number) {
  return db
    .select()
    .from(courseReviews)
    .where(
      and(eq(courseReviews.userId, userId), eq(courseReviews.courseId, courseId))
    )
    .get();
}

export function getCourseAverageRating(courseId: number) {
  const result = db
    .select({
      averageRating: avg(courseReviews.rating),
      reviewCount: count(courseReviews.id),
    })
    .from(courseReviews)
    .where(eq(courseReviews.courseId, courseId))
    .get();

  return {
    averageRating: result?.averageRating ? Number(result.averageRating) : null,
    reviewCount: result?.reviewCount ?? 0,
  };
}

export function getAverageRatingsForCourses(courseIds: number[]) {
  if (courseIds.length === 0) return new Map();

  const results = db
    .select({
      courseId: courseReviews.courseId,
      averageRating: avg(courseReviews.rating),
      reviewCount: count(courseReviews.id),
    })
    .from(courseReviews)
    .where(inArray(courseReviews.courseId, courseIds))
    .groupBy(courseReviews.courseId)
    .all();

  const map = new Map<number, { averageRating: number | null; reviewCount: number }>();
  for (const row of results) {
    map.set(row.courseId, {
      averageRating: row.averageRating ? Number(row.averageRating) : null,
      reviewCount: row.reviewCount,
    });
  }
  return map;
}
