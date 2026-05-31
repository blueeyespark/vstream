import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, X } from "lucide-react";

export default function QuizModule({ courseTitle, lessonNumber, lessonTopic, courseId, difficulty = "intermediate" }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generateQuizQuestions', {
        courseTitle,
        lessonTopic,
        difficulty
      });
      setQuestions(res.data.questions || []);
      setUserAnswers(new Array(res.data.questions?.length || 0).fill(null));
    } catch (e) {
      console.error('Failed to generate quiz', e);
    }
    setLoading(false);
  };

  const handleAnswer = (answer) => {
    const updated = [...userAnswers];
    updated[currentQuestion] = answer;
    setUserAnswers(updated);
  };

  const submitQuiz = async () => {
    const correct = userAnswers.reduce((sum, answer, idx) => {
      return sum + (answer === questions[idx].correct_answer ? 1 : 0);
    }, 0);

    const percentage = Math.round((correct / questions.length) * 100);
    setScore(percentage);
    setShowResults(true);

    // Save quiz score
    try {
      await base44.entities.QuizScore.create({
        user_email: (await base44.auth.me()).email,
        course_id: courseId,
        course_title: courseTitle,
        lesson_number: lessonNumber,
        quiz_type: "module",
        questions: questions.map((q, idx) => ({
          question: q.question,
          correct_answer: q.correct_answer,
          user_answer: userAnswers[idx],
          is_correct: userAnswers[idx] === q.correct_answer
        })),
        score: percentage,
        total_questions: questions.length,
        correct_answers: correct,
        passed: percentage >= 70,
        taken_date: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save quiz score', e);
    }
  };

  if (showResults) {
    return (
      <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-6">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 ${score >= 70 ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-amber-500/20 border border-amber-500/50'}`}>
            {score >= 70 ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            ) : (
              <X className="h-8 w-8 text-amber-400" />
            )}
          </div>
          <h3 className="text-2xl font-black text-white">Quiz Complete</h3>
          <p className={`text-4xl font-black mt-2 ${score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{score}%</p>
          <p className="text-blue-100/50 mt-2">{score >= 70 ? 'Great job! You passed.' : 'Keep practicing to reach 70%+'}</p>
        </div>

        <div className="space-y-3 mb-6">
          {questions.map((q, idx) => (
            <div key={idx} className={`rounded-lg border p-3 ${userAnswers[idx] === q.correct_answer ? 'border-emerald-500/30 bg-emerald-500/8' : 'border-red-500/30 bg-red-500/8'}`}>
              <p className="text-sm font-black text-white mb-2">{idx + 1}. {q.question}</p>
              <p className="text-xs text-blue-100/60">Your answer: <span className={userAnswers[idx] === q.correct_answer ? 'text-emerald-400' : 'text-red-400'}>{userAnswers[idx]}</span></p>
              {userAnswers[idx] !== q.correct_answer && (
                <p className="text-xs text-emerald-400 mt-1">Correct: {q.correct_answer}</p>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => { setShowResults(false); setQuestions([]); setCurrentQuestion(0); }} className="w-full rounded-lg bg-[#1e78ff] py-2 text-white font-black hover:bg-[#3d8fff] transition">
          Retake Quiz
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-6 text-center">
        <h3 className="font-black text-white mb-2">Lesson Quiz</h3>
        <p className="text-sm text-blue-100/60 mb-4">Test your knowledge with AI-generated questions</p>
        <button onClick={generateQuiz} disabled={loading} className="rounded-lg bg-purple-500/20 border border-purple-500/50 px-6 py-2 text-purple-300 font-black hover:bg-purple-500/30 transition disabled:opacity-50">
          {loading ? <><Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Start Quiz'}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-blue-100/60">Question {currentQuestion + 1} of {questions.length}</p>
          <div className="h-2 w-32 bg-[#12305f] rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <h3 className="font-black text-white mb-6 text-lg">{questions[currentQuestion].question}</h3>

      <div className="space-y-3 mb-6">
        {questions[currentQuestion].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option)}
            className={`w-full rounded-lg border p-4 text-left font-black transition ${
              userAnswers[currentQuestion] === option
                ? 'border-purple-500/50 bg-purple-500/20 text-white'
                : 'border-[#1a3a60] bg-[#03080f] text-blue-100 hover:border-purple-500/30'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} className="rounded-lg border border-[#12305f] px-4 py-2 text-white font-black hover:bg-[#12305f]/50 transition disabled:opacity-50">
          Previous
        </button>
        {currentQuestion < questions.length - 1 ? (
          <button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="flex-1 rounded-lg bg-purple-500/20 border border-purple-500/50 py-2 text-purple-300 font-black hover:bg-purple-500/30 transition">
            Next
          </button>
        ) : (
          <button onClick={submitQuiz} className="flex-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 py-2 text-emerald-300 font-black hover:bg-emerald-500/30 transition">
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}