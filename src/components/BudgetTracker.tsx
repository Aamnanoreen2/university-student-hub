import React, { useState } from "react";
import { Expense, BudgetConfig } from "../types";
import { Plus, Trash2, Wallet, PieChart, ShoppingBag, BookOpen, Utensils, Home, Sparkles } from "lucide-react";

interface BudgetTrackerProps {
  budget: BudgetConfig;
  onUpdateBudgetLimit: (limit: number) => void;
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORY_META = {
  textbooks: { label: "Textbooks & Supplies", color: "bg-teal-500", text: "text-teal-600", light: "bg-teal-50" },
  tuition: { label: "Tuition & Fees", color: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
  rent: { label: "Rent & Utilities", color: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50" },
  food: { label: "Meals & Groceries", color: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
  social: { label: "Social & Entertainment", color: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50" },
  transport: { label: "Bus, Gas & Transport", color: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50" },
  subscriptions: { label: "Streaming & Tech Tools", color: "bg-sky-500", text: "text-sky-600", light: "bg-sky-50" },
  other: { label: "Other Expenses", color: "bg-slate-500", text: "text-slate-600", light: "bg-slate-50" },
};

export default function BudgetTracker({
  budget,
  onUpdateBudgetLimit,
  onAddExpense,
  onDeleteExpense,
}: BudgetTrackerProps) {
  // Budget Limit Input
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState(budget.monthlyLimit.toString());

  // New Expense Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense({
      title: title.trim(),
      amount: parsedAmount,
      category,
      date,
    });

    setTitle("");
    setAmount("");
    setCategory("food");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleUpdateLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(limitInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudgetLimit(val);
      setEditingLimit(false);
    }
  };

  const totalSpent = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = budget.monthlyLimit - totalSpent;
  const spentPercent = budget.monthlyLimit > 0 ? (totalSpent / budget.monthlyLimit) * 100 : 0;

  // Group expenditures by category
  const categoryTotals = budget.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Quick preset logger helper
  const addQuickExpense = (title: string, amt: number, cat: Expense["category"]) => {
    onAddExpense({
      title,
      amount: amt,
      category: cat,
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Status color helpers
  const getProgressColor = () => {
    if (spentPercent >= 90) return "bg-rose-500";
    if (spentPercent >= 75) return "bg-amber-500";
    return "bg-indigo-600";
  };

  const getProgressTextColor = () => {
    if (spentPercent >= 90) return "text-rose-600";
    if (spentPercent >= 75) return "text-amber-600";
    return "text-indigo-600";
  };

  return (
    <div className="space-y-6">
      {/* Budget Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Limit Setter Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Monthly Budget Goal</p>
              {editingLimit ? (
                <form onSubmit={handleUpdateLimit} className="flex items-center mt-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400 text-xs">Rs.</span>
                    <input
                      type="number"
                      required
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      className="w-28 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button type="submit" className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingLimit(false)} className="text-xs text-slate-400">
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-slate-800">Rs. {budget.monthlyLimit.toLocaleString()}</h3>
                  <button
                    onClick={() => {
                      setLimitInput(budget.monthlyLimit.toString());
                      setEditingLimit(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
                  >
                    Edit Limit
                  </button>
                </div>
              )}
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(spentPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-slate-400">{spentPercent.toFixed(0)}% spent</span>
              <span className={`font-semibold ${getProgressTextColor()}`}>
                {spentPercent >= 100 ? "Cap Exceeded!" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Expenses Logged</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">Rs. {totalSpent.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1">{budget.expenses.length} receipts registered</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Remaining Allowance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Funds Remaining</p>
            <h3 className={`text-3xl font-bold mt-1 ${remaining < 0 ? "text-rose-600" : "text-emerald-600"}`}>
              Rs. {remaining.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {remaining < 0 ? "Over budget this term!" : "Safe to spend"}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${remaining < 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
            <PieChart className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Budget layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Log Expenses / Presets */}
        <div className="space-y-6 lg:col-span-1">
          {/* Expense Input form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-indigo-600" />
              Log University Expense
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Item / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemistry Textbook PDF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (Rs. PKR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Budget Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Expense["category"])}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 px-4 rounded-xl transition shadow-sm duration-150 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Register Expense
              </button>
            </form>
          </div>

          {/* Quick-Log Presets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
              Quick Student Presets
            </h3>
            <p className="text-xs text-slate-400 mb-4">Click to instantly log common expenditures:</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => addQuickExpense("College Library Coffee", 450, "food")}
                className="text-xs p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-left font-medium text-slate-700 transition"
              >
                ☕ Coffee & Snack <span className="block text-[10px] text-slate-400 font-bold">Rs. 450</span>
              </button>
              <button
                onClick={() => addQuickExpense("University Textbook PDF", 4500, "textbooks")}
                className="text-xs p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-left font-medium text-slate-700 transition"
              >
                📚 Used Textbook <span className="block text-[10px] text-slate-400 font-bold">Rs. 4,500</span>
              </button>
              <button
                onClick={() => addQuickExpense("Campus Diner Lunch", 1200, "food")}
                className="text-xs p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-left font-medium text-slate-700 transition"
              >
                🍕 Cafeteria Lunch <span className="block text-[10px] text-slate-400 font-bold">Rs. 1,200</span>
              </button>
              <button
                onClick={() => addQuickExpense("Transit Bus Pass", 2500, "transport")}
                className="text-xs p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-left font-medium text-slate-700 transition"
              >
                🚌 Subway / Bus <span className="block text-[10px] text-slate-400 font-bold">Rs. 2,500</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Ledger & Category Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Visualizer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Category Allocations</h3>
            <div className="space-y-3.5">
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const value = categoryTotals[key] || 0;
                const percent = totalSpent > 0 ? (value / totalSpent) * 100 : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-semibold text-slate-700">{meta.label}</span>
                      <span className="text-slate-500 font-mono">
                        Rs. {value.toLocaleString()} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full ${meta.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-4">Expense Ledger</h3>
            <div className="overflow-x-auto max-h-96">
              {budget.expenses.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">No Expenses Logged</p>
                  <p className="text-xs text-slate-400 mt-0.5">Use the ledger form to input daily academic or living expenses.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 pr-4">Item</th>
                      <th className="pb-2.5">Category</th>
                      <th className="pb-2.5">Date</th>
                      <th className="pb-2.5 text-right">Amount</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                    {[...budget.expenses].reverse().map((exp) => {
                      const meta = CATEGORY_META[exp.category];
                      return (
                        <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 pr-4 font-semibold text-slate-800 truncate max-w-[150px]" title={exp.title}>
                            {exp.title}
                          </td>
                          <td className="py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.light} ${meta.text}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-xs text-slate-400">{exp.date}</td>
                          <td className="py-3 text-right font-mono font-semibold text-slate-800">Rs. {exp.amount.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => onDeleteExpense(exp.id)}
                              className="text-slate-400 hover:text-rose-500 transition p-1.5 rounded-lg hover:bg-slate-50"
                              title="Delete entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
