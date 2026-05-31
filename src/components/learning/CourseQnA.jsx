import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, ThumbsUp, CheckCircle2, Send, Plus } from "lucide-react";

export default function CourseQnA({ courseId, moduleIndex }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [answerContent, setAnswerContent] = useState("");
  const queryClient = useQueryClient();

  const { data: questions = [] } = useQuery({
    queryKey: ["course-questions", courseId, moduleIndex],
    queryFn: () => base44.entities.CourseQuestion.filter({
      course_id: courseId,
      module_index: moduleIndex
    })
  });

  const postQuestionMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.CourseQuestion.create({
        course_id: courseId,
        module_index: moduleIndex,
        author_email: user.email,
        author_name: user.full_name || user.email,
        title: questionTitle,
        content: questionContent,
        tags: [],
        status: "open"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-questions", courseId, moduleIndex] });
      setQuestionTitle("");
      setQuestionContent("");
      setShowForm(false);
    }
  });

  const postAnswerMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const answer = await base44.entities.CourseAnswer.create({
        question_id: selectedQuestion.id,
        course_id: courseId,
        author_email: user.email,
        author_name: user.full_name || user.email,
        author_role: "student",
        content: answerContent
      });

      // Update answer count
      await base44.entities.CourseQuestion.update(selectedQuestion.id, {
        answer_count: (selectedQuestion.answer_count || 0) + 1
      });

      return answer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-answers", selectedQuestion.id] });
      setAnswerContent("");
    }
  });

  if (selectedQuestion) {
    return <QuestionDetail question={selectedQuestion} courseId={courseId} onBack={() => setSelectedQuestion(null)} />;
  }

  return (
    <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#00c8ff]" /> Q&A Discussion
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-[#1e78ff]/20 border border-[#1e78ff]/50 px-3 py-2 text-sm font-black text-[#00c8ff] hover:bg-[#1e78ff]/30 transition"
        >
          <Plus className="h-4 w-4" /> Ask Question
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-[#1a3a60] bg-[#03080f] p-4">
          <input
            placeholder="Question title"
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            className="w-full mb-2 rounded-lg border border-[#12305f] bg-[#06101f] px-3 py-2 text-white outline-none placeholder:text-blue-200/30"
          />
          <textarea
            placeholder="Describe your question in detail..."
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
            rows={3}
            className="w-full mb-3 rounded-lg border border-[#12305f] bg-[#06101f] px-3 py-2 text-white outline-none placeholder:text-blue-200/30 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => postQuestionMutation.mutate()}
              disabled={!questionTitle.trim() || postQuestionMutation.isPending}
              className="flex-1 rounded-lg bg-[#1e78ff] px-4 py-2 text-white font-black hover:bg-[#3d8fff] transition disabled:opacity-50"
            >
              Post Question
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[#12305f] px-4 py-2 text-blue-100 font-black hover:bg-[#12305f]/30 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {questions.length === 0 ? (
          <p className="text-center text-sm text-blue-100/50 py-4">No questions yet. Be the first to ask!</p>
        ) : (
          questions.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuestion(q)}
              className="w-full text-left rounded-lg border border-[#1a3a60] bg-[#03080f] p-3 hover:border-[#1e78ff]/40 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white">{q.title}</p>
                  <p className="text-xs text-blue-100/50 mt-1">Asked by {q.author_name}</p>
                  <div className="flex items-center gap-4 text-xs text-blue-100/40 mt-1">
                    <span>{q.answer_count || 0} answers</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {q.upvotes || 0}</span>
                    {q.best_answer_id && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function QuestionDetail({ question, courseId, onBack }) {
  const { data: answers = [] } = useQuery({
    queryKey: ["course-answers", question.id],
    queryFn: () => base44.entities.CourseAnswer.filter({ question_id: question.id })
  });

  const [answerContent, setAnswerContent] = useState("");
  const queryClient = useQueryClient();

  const postAnswerMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const answer = await base44.entities.CourseAnswer.create({
        question_id: question.id,
        course_id: courseId,
        author_email: user.email,
        author_name: user.full_name || user.email,
        author_role: "student",
        content: answerContent
      });

      await base44.entities.CourseQuestion.update(question.id, {
        answer_count: (question.answer_count || 0) + 1
      });

      return answer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-answers", question.id] });
      setAnswerContent("");
    }
  });

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm font-black text-[#00c8ff] hover:underline">&larr; Back to Q&A</button>
      
      <div className="rounded-lg border border-[#1a3a60] bg-[#03080f] p-4">
        <h3 className="text-lg font-black text-white mb-2">{question.title}</h3>
        <p className="text-sm text-blue-100/70 mb-3">{question.content}</p>
        <div className="flex items-center gap-4 text-xs text-blue-100/50">
          <span>Asked by {question.author_name}</span>
          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {question.upvotes || 0}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-black text-white">Answers ({answers.length})</h4>
        {answers.map((a) => (
          <div key={a.id} className={`rounded-lg border p-3 ${a.is_verified ? 'border-emerald-500/50 bg-emerald-500/8' : 'border-[#1a3a60] bg-[#03080f]'}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-black text-white">{a.author_name}</p>
                <p className="text-xs text-blue-100/50">{a.author_role}</p>
              </div>
              {a.is_verified && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            </div>
            <p className="text-sm text-blue-100/70 mb-2">{a.content}</p>
            <div className="flex items-center gap-3 text-xs text-blue-100/50">
              <button className="flex items-center gap-1 hover:text-[#00c8ff]">
                <ThumbsUp className="h-3 w-3" /> {a.upvotes || 0}
              </button>
              <button className="hover:text-[#00c8ff]">Helpful ({a.helpful_count || 0})</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#1a3a60] bg-[#03080f] p-4">
        <textarea
          placeholder="Share your answer..."
          value={answerContent}
          onChange={(e) => setAnswerContent(e.target.value)}
          rows={3}
          className="w-full mb-3 rounded-lg border border-[#12305f] bg-[#06101f] px-3 py-2 text-white outline-none placeholder:text-blue-200/30 resize-none"
        />
        <button
          onClick={() => postAnswerMutation.mutate()}
          disabled={!answerContent.trim() || postAnswerMutation.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1e78ff] px-4 py-2 text-white font-black hover:bg-[#3d8fff] transition disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> Post Answer
        </button>
      </div>
    </div>
  );
}