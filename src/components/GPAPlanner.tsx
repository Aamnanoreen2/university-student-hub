import React, { useState } from "react";
import { Semester, Course, StudentProfile } from "../types";
import { Plus, Trash2, Award, BookOpen, GraduationCap, Calendar, CheckCircle, Clock, TrendingUp, Printer, Download, X, FileText } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

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

export const getGradeFromMarks = (marks: number): string => {
  if (marks >= 85) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 75) return "B+";
  if (marks >= 70) return "B";
  if (marks >= 65) return "B-";
  if (marks >= 60) return "C+";
  if (marks >= 55) return "C";
  if (marks >= 50) return "D";
  return "F";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
        <p className="font-bold mb-1.5 text-slate-200">{label}</p>
        <div className="space-y-1">
          <p className="flex justify-between gap-6">
            <span className="text-slate-400 font-medium">Cumulative GPA:</span>
            <span className="font-mono font-bold text-indigo-400">{Number(payload[0].value).toFixed(2)}</span>
          </p>
          {payload[1] && (
            <p className="flex justify-between gap-6">
              <span className="text-slate-400 font-medium">Semester GPA:</span>
              <span className="font-mono font-bold text-indigo-200">{Number(payload[1].value).toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const GradeTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
        <p className="font-bold mb-1 text-slate-200">Grade {data.grade}</p>
        <p className="flex justify-between gap-4">
          <span className="text-slate-400 font-medium">Completed:</span>
          <span className="font-mono font-bold text-indigo-400">{data.count} {data.count === 1 ? "Course" : "Courses"}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface GPAPlannerProps {
  studentProfile?: StudentProfile;
  onUpdateStudentProfile?: (updated: Partial<StudentProfile>) => void;
  semesters: Semester[];
  courses: Course[];
  onAddSemester: (name: string) => void;
  onDeleteSemester: (id: string) => void;
  onAddCourse: (course: Omit<Course, "id">) => void;
  onDeleteCourse: (id: string) => void;
  onUpdateCourse: (id: string, updated: Partial<Course>) => void;
}

export default function GPAPlanner({
  studentProfile,
  onUpdateStudentProfile,
  semesters,
  courses,
  onAddSemester,
  onDeleteSemester,
  onAddCourse,
  onDeleteCourse,
  onUpdateCourse,
}: GPAPlannerProps) {
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    semesters[0]?.id || ""
  );
  const [newSemesterName, setNewSemesterName] = useState("");
  
  // Transcript Export Modal States
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [studentName, setStudentName] = useState(studentProfile?.studentName || "");
  const [studentId, setStudentId] = useState(studentProfile?.studentId || "");

  // Keep modal inputs in sync with studentProfile changes
  React.useEffect(() => {
    if (studentProfile?.studentName) setStudentName(studentProfile.studentName);
    if (studentProfile?.studentId) setStudentId(studentProfile.studentId);
  }, [studentProfile?.studentName, studentProfile?.studentId]);
  
  // New Course Form State
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [credits, setCredits] = useState<number>(3);
  const [status, setStatus] = useState<Course["status"]>("active");
  const [grade, setGrade] = useState("");
  const [marks, setMarks] = useState<string>("");

  // Ensure selected semester fallback is correct
  React.useEffect(() => {
    if (!selectedSemesterId && semesters.length > 0) {
      setSelectedSemesterId(semesters[0].id);
    }
  }, [semesters, selectedSemesterId]);

  const handleAddSemesterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemesterName.trim()) return;
    onAddSemester(newSemesterName.trim());
    setNewSemesterName("");
  };

  const handleMarksChange = (val: string) => {
    setMarks(val);
    if (val !== "") {
      const num = Number(val);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        const suggestedGrade = getGradeFromMarks(num);
        setGrade(suggestedGrade);
      }
    }
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemesterId) return;
    if (!courseName.trim() || !courseCode.trim()) return;

    onAddCourse({
      semesterId: selectedSemesterId,
      name: courseName.trim(),
      code: courseCode.trim().toUpperCase(),
      credits: Number(credits) || 0,
      grade: status === "completed" ? grade : "",
      marks: status === "completed" && marks !== "" ? Number(marks) : undefined,
      status,
    });

    // Reset fields
    setCourseName("");
    setCourseCode("");
    setCredits(3);
    setStatus("active");
    setGrade("");
    setMarks("");
  };

  // GPA Calculation Logic
  const getSemesterGPA = (semId: string) => {
    const semCourses = courses.filter((c) => c.semesterId === semId && c.status === "completed" && c.grade);
    if (semCourses.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    semCourses.forEach((c) => {
      const gp = GRADE_POINTS[c.grade];
      if (gp !== undefined) {
        totalPoints += gp * c.credits;
        totalCredits += c.credits;
      }
    });

    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  };

  const getCumulativeGPA = () => {
    const completedCoursesWithGrades = courses.filter(
      (c) => c.status === "completed" && c.grade && GRADE_POINTS[c.grade] !== undefined
    );
    if (completedCoursesWithGrades.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    completedCoursesWithGrades.forEach((c) => {
      const gp = GRADE_POINTS[c.grade];
      totalPoints += gp * c.credits;
      totalCredits += c.credits;
    });

    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  };

  const getTotalCredits = (completedOnly = false) => {
    const targetCourses = completedOnly
      ? courses.filter((c) => c.status === "completed")
      : courses;
    return targetCourses.reduce((sum, c) => sum + c.credits, 0);
  };

  const currentSemesterCourses = courses.filter((c) => c.semesterId === selectedSemesterId);
  const cumulativeGPA = getCumulativeGPA();
  const semesterGPA = getSemesterGPA(selectedSemesterId);
  const completedCredits = getTotalCredits(true);
  const totalCredits = getTotalCredits(false);

  const getChartData = () => {
    const data: { name: string; semesterGPA: number; cumulativeGPA: number }[] = [];
    let cumulativePoints = 0;
    let cumulativeCredits = 0;

    semesters.forEach((sem) => {
      const semCompletedCourses = courses.filter(
        (c) => c.semesterId === sem.id && c.status === "completed" && c.grade && GRADE_POINTS[c.grade] !== undefined
      );

      if (semCompletedCourses.length > 0) {
        let semPoints = 0;
        let semCredits = 0;

        semCompletedCourses.forEach((c) => {
          const gp = GRADE_POINTS[c.grade];
          semPoints += gp * c.credits;
          semCredits += c.credits;
          
          cumulativePoints += gp * c.credits;
          cumulativeCredits += c.credits;
        });

        const semesterGPA = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : 0;
        const cumulativeGPA = cumulativeCredits > 0 ? Number((cumulativePoints / cumulativeCredits).toFixed(2)) : 0;

        data.push({
          name: sem.name,
          semesterGPA,
          cumulativeGPA,
        });
      }
    });

    return data;
  };

  const chartData = getChartData();

  const getGradeDistributionData = () => {
    const gradesList = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];
    const completedCourses = courses.filter(
      (c) => c.status === "completed" && c.grade && GRADE_POINTS[c.grade] !== undefined
    );

    const counts: Record<string, number> = {};
    gradesList.forEach((g) => {
      counts[g] = 0;
    });

    completedCourses.forEach((c) => {
      if (c.grade && counts[c.grade] !== undefined) {
        counts[c.grade]++;
      }
    });

    const data = gradesList.map((g) => ({
      grade: g,
      count: counts[g],
    }));

    const hasData = completedCourses.length > 0;

    return { data, hasData };
  };

  const gradeDistribution = getGradeDistributionData();

  const handleDownloadTextTranscript = () => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let content = "";
    content += "========================================================================\n";
    content += "                      OFFICIAL ACADEMIC TRANSCRIPT                      \n";
    content += "========================================================================\n\n";
    content += `Student Name:    ${studentName}\n`;
    content += `Student ID:      ${studentId}\n`;
    content += `Date Generated:  ${today}\n`;
    content += `Institution:     University Student Hub\n`;
    content += "------------------------------------------------------------------------\n";
    content += `Cumulative GPA:  ${cumulativeGPA.toFixed(2)} / 4.00\n`;
    content += `Total Credits:   ${completedCredits} Completed / ${totalCredits} Total\n`;
    content += "========================================================================\n\n";

    semesters.forEach((sem) => {
      const semCourses = courses.filter((c) => c.semesterId === sem.id);
      const semCompleted = semCourses.filter(
        (c) => c.status === "completed" && c.grade && GRADE_POINTS[c.grade] !== undefined
      );
      
      let semPoints = 0;
      let semCredits = 0;
      semCompleted.forEach((c) => {
        const gp = GRADE_POINTS[c.grade];
        semPoints += gp * c.credits;
        semCredits += c.credits;
      });
      const semGPA = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : 0.0;
      const semTotalCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);

      content += `TERM: ${sem.name.toUpperCase()}\n`;
      content += `Term GPA: ${semGPA.toFixed(2)} | Credits: ${semCredits} Completed / ${semTotalCredits} Registered\n`;
      content += "------------------------------------------------------------------------\n";
      content += "CODE      | COURSE TITLE                       | CREDITS | MARKS | GRADE\n";
      content += "------------------------------------------------------------------------\n";

      if (semCourses.length === 0) {
        content += "No courses registered for this term.\n";
      } else {
        semCourses.forEach((c) => {
          const codeStr = c.code.padEnd(9).substring(0, 9);
          const titleStr = c.name.padEnd(34).substring(0, 34);
          const creditStr = String(c.credits).padStart(7);
          const marksStr = (c.status === "completed" && c.marks !== undefined ? String(c.marks) : "—").padStart(5);
          const gradeStr = (c.status === "completed" ? c.grade : "IP").padStart(5);
          content += `${codeStr} | ${titleStr} | ${creditStr} | ${marksStr} | ${gradeStr}\n`;
        });
      }
      content += "========================================================================\n\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${studentName.trim().replace(/\s+/g, "_")}_Academic_Transcript.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintTranscript = () => {
    const printContent = document.getElementById("printable-transcript");
    if (!printContent) return;
    const originalTitle = document.title;
    document.title = `${studentName.replace(/\s+/g, "_")}_Academic_Transcript`;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Academic Transcript - ${studentName}</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                color: #1e293b;
                padding: 40px;
                line-height: 1.5;
              }
              .header {
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .meta-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-top: 15px;
                font-size: 14px;
              }
              .meta-item {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px dashed #e2e8f0;
                padding-bottom: 4px;
              }
              .semester-block {
                margin-bottom: 30px;
                page-break-inside: avoid;
              }
              .semester-title {
                font-size: 16px;
                font-weight: bold;
                background-color: #f8fafc;
                padding: 8px 12px;
                border-left: 4px solid #4f46e5;
                margin-bottom: 15px;
                display: flex;
                justify-content: space-between;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
              }
              th {
                text-align: left;
                font-weight: 600;
                color: #475569;
                border-bottom: 2px solid #f1f5f9;
                padding: 8px;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 0.05em;
              }
              td {
                padding: 10px 8px;
                border-bottom: 1px solid #f1f5f9;
              }
              .grade-badge {
                font-weight: 700;
                color: #4f46e5;
              }
              .summary-footer {
                margin-top: 40px;
                border-top: 2px solid #e2e8f0;
                padding-top: 20px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                font-size: 14px;
              }
              .gpa-card {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
              }
              .gpa-val {
                font-size: 28px;
                font-weight: 800;
                color: #4f46e5;
                margin-top: 5px;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div style="max-width: 800px; margin: 0 auto;">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    document.title = originalTitle;
  };

  return (
    <div className="space-y-6">
      {/* GPA Header Block with Transcript Export Action */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            GPA Planner & Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Calculate Semester and Cumulative GPA, visualize academic trends, and download or print formal transcript summaries.
          </p>
        </div>
        <button
          onClick={() => setShowTranscriptModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4.5 rounded-xl shadow-sm transition flex items-center justify-center gap-2 self-start md:self-center"
        >
          <Printer className="h-4 w-4" />
          Export Transcript
        </button>
      </div>

      {/* GPA Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div id="gpa-card-cum" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cumulative GPA</p>
            <h3 className="text-2xl font-bold text-slate-800">{cumulativeGPA.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Scale: 4.00 Max</p>
          </div>
        </div>

        <div id="gpa-card-sem" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Semester GPA</p>
            <h3 className="text-2xl font-bold text-slate-800">{semesterGPA.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Selected Term</p>
          </div>
        </div>

        <div id="gpa-card-credits" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Credits Completed</p>
            <h3 className="text-2xl font-bold text-slate-800">{completedCredits} / {totalCredits}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Degree progress</p>
          </div>
        </div>

        <div id="gpa-card-courses" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Courses</p>
            <h3 className="text-2xl font-bold text-slate-800">{courses.length}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{courses.filter(c => c.status === "active").length} active this term</p>
          </div>
        </div>
      </div>

      {/* GPA Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Progress Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
                  GPA Progress Trend
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Visualizing your academic journey across completed terms</p>
              </div>
              {/* Legend indicator */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-600 block"></span>
                  <span className="text-slate-600 font-semibold">Cumulative GPA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-300 block"></span>
                  <span className="text-slate-500 font-medium">Semester GPA</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-slate-100 rounded-xl bg-slate-50/50 p-6">
                  <TrendingUp className="h-10 w-10 text-slate-300 mb-2" />
                  <h3 className="text-sm font-semibold text-slate-500">No GPA Progress Trend Data Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Add completed courses with grades to map your GPA growth curve across semesters.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 4.0]} 
                      ticks={[0, 1.0, 2.0, 3.0, 4.0]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeGPA" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                      dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="semesterGPA" 
                      stroke="#a5b4fc" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: "#ffffff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Grade Distribution Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Award className="mr-2 h-5 w-5 text-indigo-600" />
                  Grade Distribution
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Frequency of grades earned across all completed courses</p>
              </div>
              {gradeDistribution.hasData && (
                <div className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {courses.filter(c => c.status === "completed" && c.grade).length} Graded Courses
                </div>
              )}
            </div>

            <div className="h-64 w-full">
              {!gradeDistribution.hasData ? (
                <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-slate-100 rounded-xl bg-slate-50/50 p-6">
                  <Award className="h-10 w-10 text-slate-300 mb-2" />
                  <h3 className="text-sm font-semibold text-slate-500">No Grade Distribution Data</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Add completed courses with grades to view your academic strengths distribution.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="grade" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<GradeTooltip />} />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                    >
                      {gradeDistribution.data.map((entry, index) => {
                        let fill = "#cbd5e1"; // default slate gray
                        if (entry.grade.startsWith("A")) fill = "#4f46e5"; // indigo primary for top-tier
                        else if (entry.grade.startsWith("B")) fill = "#6366f1"; // medium indigo
                        else if (entry.grade.startsWith("C")) fill = "#818cf8"; // soft indigo
                        else if (entry.grade.startsWith("D")) fill = "#fbbf24"; // warning yellow
                        else if (entry.grade === "F") fill = "#f87171"; // error red
                        
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Semesters selection & course input */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Semester Manager & Add Course */}
        <div className="space-y-6 lg:col-span-1">
          {/* Semester Selector Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
              Academic Terms
            </h2>

            {/* List of Semesters */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto mb-4 pr-1">
              {semesters.map((sem) => (
                <div
                  key={sem.id}
                  onClick={() => setSelectedSemesterId(sem.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    selectedSemesterId === sem.id
                      ? "bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium"
                      : "bg-slate-50 border border-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{sem.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this semester? All its courses will be deleted too.")) {
                        onDeleteSemester(sem.id);
                        if (selectedSemesterId === sem.id) {
                          setSelectedSemesterId(semesters.find(s => s.id !== sem.id)?.id || "");
                        }
                      }
                    }}
                    className="text-slate-400 hover:text-rose-500 transition p-1 rounded-lg"
                    title="Delete semester"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {semesters.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No semesters added yet.</p>
              )}
            </div>

            {/* Add Semester Form */}
            <form onSubmit={handleAddSemesterSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Fall 2026"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition shadow-sm flex items-center justify-center shrink-0"
                title="Add semester"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Add Course Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Plus className="mr-2 h-5 w-5 text-indigo-600" />
              Add New Course
            </h2>

            {!selectedSemesterId ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                Please create and select an academic term first to add courses.
              </p>
            ) : (
              <form onSubmit={handleAddCourseSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS 101"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Programming"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Credits</label>
                    <select
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="0">0 Credits (Non-Credit/Lab)</option>
                      <option value="1">1 Credit</option>
                      <option value="2">2 Credits</option>
                      <option value="3">3 Credits</option>
                      <option value="4">4 Credits</option>
                      <option value="5">5 Credits</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => {
                        const val = e.target.value as Course["status"];
                        setStatus(val);
                        if (val !== "completed") setGrade("");
                      }}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="planned">Planned</option>
                    </select>
                  </div>
                </div>

                {status === "completed" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Marks (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 85"
                        value={marks}
                        onChange={(e) => handleMarksChange(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Grade Earned</label>
                      <select
                        required
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="">Select Grade</option>
                        {Object.keys(GRADE_POINTS).map((g) => (
                          <option key={g} value={g}>
                            {g} (GP: {GRADE_POINTS[g].toFixed(1)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 px-4 rounded-xl transition shadow-sm duration-150 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Course
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Course Table & Term Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {semesters.find((s) => s.id === selectedSemesterId)?.name || "Select Term"} Courses
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage classes for the selected semester</p>
              </div>
              {selectedSemesterId && currentSemesterCourses.length > 0 && (
                <div className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
                  Term GPA: {semesterGPA.toFixed(2)}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-x-auto">
              {currentSemesterCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 p-6">
                  <BookOpen className="h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-600">No Courses Registered</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Add classes for this semester to begin tracking credits, calculating GPA, and logging tasks.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pr-2">Code</th>
                      <th className="pb-3 pr-4">Course Name</th>
                      <th className="pb-3 text-center">Credits</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Marks</th>
                      <th className="pb-3 text-center">Grade</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                    {currentSemesterCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 pr-2 font-mono font-semibold text-indigo-600 whitespace-nowrap">
                          {course.code}
                        </td>
                        <td className="py-3.5 pr-4 font-medium text-slate-800 max-w-[200px] truncate" title={course.name}>
                          {course.name}
                        </td>
                        <td className="py-3.5 text-center font-mono">{course.credits}</td>
                        <td className="py-3.5 text-center">
                          <select
                            value={course.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as Course["status"];
                              onUpdateCourse(course.id, {
                                status: newStatus,
                                grade: newStatus === "completed" ? course.grade || "A" : "",
                              });
                            }}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none transition ${
                              course.status === "active"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : course.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="planned">Planned</option>
                          </select>
                        </td>
                        <td className="py-3.5 text-center">
                          {course.status === "completed" ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="—"
                              value={course.marks !== undefined ? course.marks : ""}
                              onChange={(e) => {
                                const mVal = e.target.value;
                                const mNum = mVal === "" ? undefined : Number(mVal);
                                if (mNum !== undefined && (mNum < 0 || mNum > 100)) return;
                                const updatedGrade = mNum !== undefined ? getGradeFromMarks(mNum) : course.grade;
                                onUpdateCourse(course.id, {
                                  marks: mNum,
                                  grade: updatedGrade,
                                });
                              }}
                              className="w-14 font-mono text-xs font-bold text-center bg-slate-50 border border-slate-200 rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3.5 text-center">
                          {course.status === "completed" ? (
                            <select
                              value={course.grade}
                              onChange={(e) => onUpdateCourse(course.id, { grade: e.target.value })}
                              className="font-mono text-xs font-bold bg-slate-50 border border-slate-200 rounded-md py-0.5 px-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              {Object.keys(GRADE_POINTS).map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-400 text-xs italic flex items-center justify-center gap-1">
                              <Clock className="h-3 w-3" /> In Progress
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => onDeleteCourse(course.id)}
                            className="text-slate-400 hover:text-rose-500 transition p-1.5 rounded-lg hover:bg-slate-100"
                            title="Delete course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Export Modal */}
      {showTranscriptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Title & Customization Inputs */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Printer className="h-5 w-5 text-indigo-600" />
                  Academic Transcript Summary
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize student metadata before exporting or printing</p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Name:</span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStudentName(val);
                      if (onUpdateStudentProfile) onUpdateStudentProfile({ studentName: val });
                    }}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium w-32"
                    placeholder="Student Name"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">ID:</span>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStudentId(val);
                      if (onUpdateStudentProfile) onUpdateStudentProfile({ studentId: val });
                    }}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium w-28"
                    placeholder="Student ID"
                  />
                </div>
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition ml-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Transcript Document Preview Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
              <div 
                id="printable-transcript" 
                className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md max-w-3xl mx-auto text-slate-800 font-sans"
              >
                {/* Transcript Document Header */}
                <div className="border-b-2 border-slate-800 pb-5 mb-6 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="h-5 w-5 text-slate-800" />
                      <span className="font-mono font-bold text-[10px] tracking-widest text-slate-500 uppercase">Academic Record</span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">OFFICIAL TRANSCRIPT SUMMARY</h2>
                    <p className="text-[10px] text-slate-400 font-medium font-mono mt-1">UNIVERSITY STUDENT PORTAL • ID: {studentId}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono w-full md:w-auto shrink-0 space-y-1">
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">DATE GENERATED:</span>
                      <span className="font-bold text-slate-700">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">STUDENT NAME:</span>
                      <span className="font-bold text-slate-700 uppercase">{studentName}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">STUDENT IDENTIFICATION:</span>
                      <span className="font-bold text-slate-700">{studentId}</span>
                    </div>
                  </div>
                </div>

                {/* Transcript Semesters */}
                <div className="space-y-6">
                  {semesters.map((sem) => {
                    const semCourses = courses.filter((c) => c.semesterId === sem.id);
                    const semCompleted = semCourses.filter(
                      (c) => c.status === "completed" && c.grade && GRADE_POINTS[c.grade] !== undefined
                    );

                    let semPoints = 0;
                    let semCredits = 0;
                    semCompleted.forEach((c) => {
                      const gp = GRADE_POINTS[c.grade];
                      semPoints += gp * c.credits;
                      semCredits += c.credits;
                    });

                    const semGPA = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : 0.0;
                    const semTotalCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);

                    return (
                      <div key={sem.id} className="semester-block">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-2">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">{sem.name}</h4>
                          <div className="flex gap-4 text-[10px] font-mono">
                            <span>Term GPA: <strong className="text-indigo-600 font-bold">{semGPA.toFixed(2)}</strong></span>
                            <span className="text-slate-300">|</span>
                            <span>Credits Completed: <strong className="text-slate-700 font-semibold">{semCredits} / {semTotalCredits}</strong></span>
                          </div>
                        </div>

                        {semCourses.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-1">No registered courses for this academic term.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                                  <th className="py-1.5 px-2">Code</th>
                                  <th className="py-1.5 px-2">Course Name</th>
                                  <th className="py-1.5 text-center">Credits</th>
                                  <th className="py-1.5 text-center">Marks</th>
                                  <th className="py-1.5 text-right">Grade</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                                {semCourses.map((c) => (
                                  <tr key={c.id} className="hover:bg-slate-50/20">
                                    <td className="py-1.5 px-2 font-bold text-slate-800 whitespace-nowrap">{c.code}</td>
                                    <td className="py-1.5 px-2 font-sans font-medium text-slate-700 truncate max-w-[240px]">{c.name}</td>
                                    <td className="py-1.5 text-center">{c.credits}</td>
                                    <td className="py-1.5 text-center">{c.status === "completed" && c.marks !== undefined ? `${c.marks}%` : "—"}</td>
                                    <td className="py-1.5 text-right font-bold text-indigo-600">{c.status === "completed" ? c.grade : "IP"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {semesters.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                      <GraduationCap className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-400">No Academic Terms Added</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Add courses and completed semesters to populate transcript</p>
                    </div>
                  )}
                </div>

                {/* Transcript Document Summary Footer */}
                <div className="border-t border-slate-800 mt-6 pt-5 flex flex-col md:flex-row justify-between items-center gap-4 font-mono">
                  <div className="text-left">
                    <span className="font-bold text-[9px] tracking-wider text-slate-400 uppercase">Validation Signature</span>
                    <div className="border-b border-slate-300 w-40 mt-5"></div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Hub Registrar Verification Signature</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center min-w-[100px]">
                      <span className="text-[9px] text-slate-400 block font-bold">TOTAL CREDITS</span>
                      <span className="text-sm font-black text-slate-800 mt-0.5 block">{completedCredits}</span>
                      <span className="text-[8px] text-slate-400 block">Completed</span>
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2 text-center min-w-[100px]">
                      <span className="text-[9px] text-indigo-400 block font-bold">CUMULATIVE GPA</span>
                      <span className="text-sm font-black text-indigo-600 mt-0.5 block">{cumulativeGPA.toFixed(2)}</span>
                      <span className="text-[8px] text-indigo-400 block">out of 4.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-end bg-slate-50">
              <button
                onClick={handleDownloadTextTranscript}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                Download Text (.txt)
              </button>
              <button
                onClick={handlePrintTranscript}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / PDF Summary
              </button>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs py-2 px-3 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
