import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, TrendingUp, Flame } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface Meal { id: string; name: string; time: 'breakfast' | 'lunch' | 'dinner' | 'snack'; calories: number; protein: number; carbs: number; fat: number; }

const MEAL_COLORS = { breakfast: '#E879A0', lunch: '#4ADE80', dinner: '#38BDF8', snack: '#FBBF24' };
const MACRO_COLORS = ['#E879A0', '#4ADE80', '#38BDF8'];
const CALORIE_GOAL = 2000;

const SEED_MEALS: Meal[] = [
  { id: '1', name: 'Oatmeal with berries', time: 'breakfast', calories: 320, protein: 12, carbs: 54, fat: 6 },
  { id: '2', name: 'Grilled chicken salad', time: 'lunch', calories: 480, protein: 42, carbs: 18, fat: 22 },
  { id: '3', name: 'Apple', time: 'snack', calories: 95, protein: 0, carbs: 25, fat: 0 },
];

const WEEK_DATA = [
  { day: 'Mon', cal: 1850 }, { day: 'Tue', cal: 2100 }, { day: 'Wed', cal: 1750 },
  { day: 'Thu', cal: 2200 }, { day: 'Fri', cal: 1920 }, { day: 'Sat', cal: 2350 }, { day: 'Sun', cal: 0 },
];

export const NutritionLogPage: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>(SEED_MEALS);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState<Omit<Meal, 'id'>>({ name: '', time: 'breakfast', calories: 0, protein: 0, carbs: 0, fat: 0 });

  const totalCal  = meals.reduce((s, m) => s + m.calories, 0);
  const totalProt = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarb = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat  = meals.reduce((s, m) => s + m.fat, 0);
  const calPct = Math.min(Math.round((totalCal / CALORIE_GOAL) * 100), 100);

  const macroData = [
    { name: 'Protein', value: totalProt, unit: 'g' },
    { name: 'Carbs',   value: totalCarb, unit: 'g' },
    { name: 'Fat',     value: totalFat,  unit: 'g' },
  ];

  const addMeal = () => {
    if (!newMeal.name) return;
    setMeals(prev => [...prev, { ...newMeal, id: Date.now().toString() }]);
    setNewMeal({ name: '', time: 'breakfast', calories: 0, protein: 0, carbs: 0, fat: 0 });
    setShowAdd(false);
  };

  const mealGroups = (['breakfast', 'lunch', 'dinner', 'snack'] as const).map(time => ({
    time, label: time.charAt(0).toUpperCase() + time.slice(1),
    meals: meals.filter(m => m.time === time),
  }));

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--green-healthy)]/10 border border-[var(--green-healthy)]/30 text-[var(--green-healthy)] text-xs font-mono-num mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5" /> NUTRITION LOG
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">Daily Nutrition</h1>
          <p className="text-[color:var(--text-muted)] text-sm mt-1">Track macros, fuel your heart.</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--green-healthy)] to-[var(--accent-cyan)] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> Log Meal
        </button>
      </div>

      {/* Calorie Bar */}
      <div className="glass-panel rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[var(--warning-amber)]" />
            <span className="text-sm font-semibold text-[color:var(--text-main)]">Daily Calories</span>
          </div>
          <span className="font-mono-num text-sm font-bold">
            <span className={totalCal > CALORIE_GOAL ? 'text-[var(--danger-rose)]' : 'text-[var(--accent-cyan)]'}>{totalCal}</span>
            <span className="text-[color:var(--text-muted)]"> / {CALORIE_GOAL} kcal</span>
          </span>
        </div>
        <div className="h-4 rounded-full bg-[color:var(--glass-border)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${calPct}%`, background: totalCal > CALORIE_GOAL ? 'var(--danger-rose)' : 'linear-gradient(90deg, var(--green-healthy), var(--accent-cyan))' }} />
        </div>
        <div className="flex justify-between text-[10px] text-[color:var(--text-muted)] font-mono-num mt-1.5">
          <span>{calPct}% of daily goal</span>
          <span>{Math.max(0, CALORIE_GOAL - totalCal)} kcal remaining</span>
        </div>
      </div>

      {/* Macro + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-heading font-bold text-[color:var(--text-main)] mb-4">Macro Breakdown</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                  {macroData.map((_, i) => <Cell key={i} fill={MACRO_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}g`, n]} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {macroData.map((m, i) => (
                <div key={m.name}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: MACRO_COLORS[i] }} />
                    <span className="text-xs text-[color:var(--text-muted)] font-mono-num">{m.name}</span>
                  </div>
                  <p className="font-bold text-lg" style={{ color: MACRO_COLORS[i] }}>{m.value}g</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-heading font-bold text-[color:var(--text-main)] mb-4">Weekly Calories</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEK_DATA} barSize={22}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 2500]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="cal" fill="var(--accent-cyan)" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--bg-dark)]/80 backdrop-blur-xl">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md mx-4 animate-fadeIn border border-[var(--green-healthy)]/20">
            <h3 className="font-heading font-bold text-lg text-[color:var(--text-main)] mb-5">Log Meal</h3>
            <div className="space-y-3">
              <input value={newMeal.name} onChange={e => setNewMeal(p => ({ ...p, name: e.target.value }))} placeholder="Meal name..."
                className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[color:var(--text-main)] focus:border-[var(--green-healthy)] outline-none" />
              <select value={newMeal.time} onChange={e => setNewMeal(p => ({ ...p, time: e.target.value as any }))}
                className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[color:var(--text-main)] focus:border-[var(--green-healthy)] outline-none">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                {([['calories', 'Calories (kcal)'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fat', 'Fat (g)']] as const).map(([field, label]) => (
                  <div key={field}>
                    <label className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mb-1 block">{label}</label>
                    <input type="number" value={(newMeal as any)[field]} onChange={e => setNewMeal(p => ({ ...p, [field]: +e.target.value }))}
                      className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-3 py-2 text-sm text-[color:var(--text-main)] focus:border-[var(--green-healthy)] outline-none" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-[color:var(--glass-border)] text-[color:var(--text-muted)] text-sm hover:border-[var(--accent-cyan)] transition-all cursor-pointer">Cancel</button>
                <button onClick={addMeal} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--green-healthy)] to-[var(--accent-cyan)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer">Add Meal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Groups */}
      <div className="space-y-5">
        {mealGroups.filter(g => g.meals.length > 0).map(group => (
          <div key={group.time} className="glass-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--glass-border)]"
              style={{ background: `${MEAL_COLORS[group.time]}08` }}>
              <h3 className="font-heading font-bold text-sm" style={{ color: MEAL_COLORS[group.time] }}>{group.label}</h3>
              <span className="text-xs font-mono-num text-[color:var(--text-muted)]">
                {group.meals.reduce((s, m) => s + m.calories, 0)} kcal
              </span>
            </div>
            <div className="divide-y divide-[color:var(--glass-border)]">
              {group.meals.map(meal => (
                <div key={meal.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--text-main)]">{meal.name}</p>
                    <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num">
                      P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-num font-bold text-sm" style={{ color: MEAL_COLORS[group.time] }}>{meal.calories}</span>
                    <button onClick={() => setMeals(prev => prev.filter(m => m.id !== meal.id))}
                      className="p-1.5 rounded-lg hover:bg-[var(--danger-rose)]/10 text-[color:var(--text-muted)] hover:text-[var(--danger-rose)] transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
