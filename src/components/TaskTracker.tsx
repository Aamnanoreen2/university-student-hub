import React, { useState } from "react";
import { AcademicTask, Course } from "../types";
import { Plus, Trash2, CheckCircle2, Clock, Calendar, AlertCircle, Filter, Sparkles } from "lucide-react";

interface TaskTrackerProps {
  tasks: AcademicTask[];
  courses: Course[];
  onAddTask: (task: Omit<AcademicTask, "id">) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updated: Partial<AcademicTask>) => void;
  onGenerateStudyPlanClick: (topic: string) => void; // Connect directly to AI companion!
}

export default function TaskTracker({
  tasks,
  courses,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onGenerateStudyPlanClick,
}: TaskTrackerProps) {
  // New Task Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [priority, setPriority] = useState<AcademicTask["priority"]>("medium");
  
  // Filtering and Sorting States
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in_progress" | "completed">("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority">("dueDate");

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      courseId,
      priority,
      status: "todo",
    });

    setTitle("");
    setDescription("");
    setDueDate("");
    setCourseId("");
    setPriority("medium");
  };

  // Helper to toggle task status
  const cycleTaskStatus = (task: AcademicTask) => {
    const nextStatusMap: Record<AcademicTask["status"], AcademicTask["status"]> = {
      todo: "in_progress",
      in_progress: "completed",
      completed: "todo",
    };
    onUpdateTask(task.id, { status: nextStatusMap[task.status] });
  };

  const getCourseCodeAndName = (cId: string) => {
    const found = courses.find((c) => c.id === cId);
    return found ? `${found.code}: ${found.name}` : "";
  };

  const getCourseCodeOnly = (cId: string) => {
    const found = courses.find((c) => c.id === cId);
    return found ? found.code : "General";
  };

  // Priority Weights for Sorting
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  // Filter & Sort Logic
  const filteredTasks = tasks
    .filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (courseFilter !== "all" && t.courseId !== courseFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
    });

  // Count summaries
  const pendingTasksCount = tasks.filter((t) => t.status !== "completed").length;
  const overdueTasksCount = tasks.filter((t) => {
    if (t.status === "completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(t.dueDate) < today;
  }).length;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Tasks</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{tasks.length}</h4>
          </div>
          <CheckCircle2 className="h-8 w-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Action</p>
            <h4 className="text-2xl font-bold text-amber-600 mt-1">{pendingTasksCount}</h4>
          </div>
          <Clock className="h-8 w-8 text-amber-500 bg-amber-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overdue Alerts</p>
            <h4 className="text-2xl font-bold text-rose-600 mt-1">{overdueTasksCount}</h4>
          </div>
          <AlertCircle className="h-8 w-8 text-rose-500 bg-rose-50 p-1.5 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Task Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-indigo-600" />
            Add Assignment or Exam
          </h3>

          <form onSubmit={handleAddTaskSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Title / Task Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Calculus Problem Set 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description / Notes</label>
              <textarea
                placeholder="e.g. Covers partial derivative definitions and practice worksheets"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AcademicTask["priority"])}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Link to Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">General Assignment (No link)</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    [{course.code}] {course.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 px-4 rounded-xl transition shadow-sm duration-150 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Save Task
            </button>
          </form>
        </div>

        {/* Right Columns: Filterable Tasks Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Filter Board</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 md:max-w-xl">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              {/* Course Filter */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none truncate"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none"
              >
                <option value="dueDate">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center shadow-sm">
                <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No Assignments Found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Adjust your active filters or add a new university assignment on the left to start organizing your study load.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isOverdue = task.status !== "completed" && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                return (
                  <div
                    key={task.id}
                    className={`bg-white border rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4 transition hover:border-slate-300 ${
                      task.status === "completed"
                        ? "border-emerald-100 bg-emerald-50/5 opacity-80"
                        : isOverdue
                        ? "border-rose-200 ring-1 ring-rose-50"
                        : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => cycleTaskStatus(task)}
                        className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          task.status === "completed"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : task.status === "in_progress"
                            ? "bg-amber-100 border-amber-400 text-amber-700"
                            : "border-slate-300 hover:border-indigo-500"
                        }`}
                        title="Click to toggle status"
                      >
                        {task.status === "completed" && (
                          <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                        )}
                        {task.status === "in_progress" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        )}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`font-semibold text-sm text-slate-800 ${
                              task.status === "completed" ? "line-through text-slate-400" : ""
                            }`}
                          >
                            {task.title}
                          </h4>
                          {/* Course Label */}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {getCourseCodeOnly(task.courseId)}
                          </span>
                          {/* Priority Badge */}
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                              task.priority === "high"
                                ? "bg-rose-50 text-rose-700"
                                : task.priority === "medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-50 text-slate-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1 max-w-xl">{task.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                          {/* Due Date display */}
                          <span
                            className={`font-medium flex items-center gap-1 ${
                              isOverdue ? "text-rose-600 font-bold" : "text-slate-400"
                            }`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Due: {task.dueDate} {isOverdue && "(OVERDUE)"}
                          </span>

                          {/* Quick AI Study Companion Link */}
                          {task.status !== "completed" && (
                            <button
                              onClick={() => onGenerateStudyPlanClick(task.title)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 font-semibold transition"
                              title="Generate customized AI learning schedule for this assignment topic"
                            >
                              <Sparkles className="h-3 w-3 text-indigo-500" />
                              Generate AI Study Plan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-slate-50"
                      title="Delete assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
