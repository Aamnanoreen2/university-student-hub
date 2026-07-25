import { Course } from "../types";

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.5,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.5,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.5,
  "D": 1.0,
  "F": 0.0,
};

export function calculateAcademicStats(courses: Course[]) {
  let totalGradePoints = 0;
  let totalCredits = 0;
  let gradedCoursesCount = 0;

  (courses || []).forEach((course) => {
    if (
      course.status === "completed" &&
      course.grade &&
      GRADE_POINTS[course.grade] !== undefined
    ) {
      const gpa = GRADE_POINTS[course.grade];
      totalGradePoints += gpa * course.credits;
      totalCredits += course.credits;
      gradedCoursesCount++;
    }
  });

  const cgpa =
    totalCredits > 0
      ? Number((totalGradePoints / totalCredits).toFixed(2))
      : 0;

  return {
    cgpa,
    totalCredits,
    gradedCoursesCount,
  };
}
