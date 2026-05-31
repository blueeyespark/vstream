import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock, Zap } from "lucide-react";

export default function LearningTimeAnalytics({ enrollments = [] }) {
  // Calculate time-based metrics
  const timeData = enrollments.map(e => ({
    course: e.course_title?.slice(0, 15),
    estimated: e.estimated_hours || 0,
    actual: e.actual_hours_spent || 0
  })).filter(d => d.estimated > 0);

  const weeklyProgress = enrollments.reduce((acc, e) => {
    if (e.learning_sessions) {
      const sessions = e.learning_sessions
        .filter(s => {
          const date = new Date(s.date);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return date > weekAgo;
        })
        .reduce((sum, s) => sum + (s.minutes_spent || 0), 0);
      
      acc.push({
        course: e.course_title?.slice(0, 12),
        minutes: Math.round(sessions)
      });
    }
    return acc;
  }, []);

  const totalHours = enrollments.reduce((sum, e) => sum + (e.actual_hours_spent || 0), 0);
  const avgPace = enrollments.length > 0 
    ? (totalHours / enrollments.filter(e => e.status === "in_progress").length || 0).toFixed(1)
    : 0;

  const fastestCompletion = enrollments
    .filter(e => e.status === "completed")
    .reduce((min, e) => {
      if (!e.estimated_hours) return min;
      const efficiency = e.actual_hours_spent / e.estimated_hours;
      return efficiency < (min.efficiency || Infinity) ? { ...e, efficiency } : min;
    }, {});

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid gap-3 grid-cols-3">
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#00c8ff]" />
            <p className="text-xs text-blue-100/60">Total Time Invested</p>
          </div>
          <p className="text-2xl font-black text-white">{totalHours.toFixed(1)}h</p>
          <p className="text-[10px] text-blue-100/40">across all courses</p>
        </div>

        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <p className="text-xs text-blue-100/60">Avg Learning Pace</p>
          </div>
          <p className="text-2xl font-black text-emerald-400">{avgPace} h/wk</p>
          <p className="text-[10px] text-blue-100/40">per active course</p>
        </div>

        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <p className="text-xs text-blue-100/60">Fastest Completion</p>
          </div>
          <p className="text-2xl font-black text-amber-400">
            {fastestCompletion.efficiency 
              ? `${(fastestCompletion.efficiency * 100).toFixed(0)}%` 
              : '—'}
          </p>
          <p className="text-[10px] text-blue-100/40">of estimated time</p>
        </div>
      </div>

      {/* Time vs Estimated */}
      {timeData.length > 0 && (
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <h3 className="text-sm font-black text-white mb-3">Actual vs Estimated Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#12305f" />
              <XAxis dataKey="course" stroke="#4a7ea0" />
              <YAxis stroke="#4a7ea0" />
              <Tooltip 
                contentStyle={{ background: '#06101f', border: '1px solid #12305f' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="estimated" fill="#1e78ff" name="Estimated" />
              <Bar dataKey="actual" fill="#00c8ff" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly Learning Activity */}
      {weeklyProgress.length > 0 && (
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <h3 className="text-sm font-black text-white mb-3">Last 7 Days Learning Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#12305f" />
              <XAxis dataKey="course" stroke="#4a7ea0" />
              <YAxis stroke="#4a7ea0" />
              <Tooltip 
                contentStyle={{ background: '#06101f', border: '1px solid #12305f' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => `${Math.round(value)} min`}
              />
              <Line type="monotone" dataKey="minutes" stroke="#00c8ff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}