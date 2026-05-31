import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Share2, Lock, Loader2, FileText } from "lucide-react";

export default function CertificateDisplay({ enrollment, onCertificateGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [certificateId] = useState(`CERT-${Date.now()}`);

  const generateCertificate = async () => {
    setGenerating(true);
    try {
      const user = await base44.auth.me();
      
      // Create certificate record
      const cert = await base44.entities.Certificate.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        course_id: enrollment.course_id,
        course_title: enrollment.course_title,
        course_type: enrollment.course_type,
        completion_date: new Date(enrollment.completed_date).toLocaleDateString(),
        final_score: enrollment.quiz_score || 100,
        certificate_id: certificateId,
        is_public: false
      });

      // Generate PDF
      const res = await base44.functions.invoke('generateCertificatePDF', {
        courseTitle: enrollment.course_title,
        courseType: enrollment.course_type,
        completionDate: new Date(enrollment.completed_date).toLocaleDateString(),
        score: enrollment.quiz_score || 100,
        certificateId: certificateId
      });

      // Trigger download
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${enrollment.course_title}_Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onCertificateGenerated?.();
    } catch (e) {
      console.error('Failed to generate certificate', e);
    }
    setGenerating(false);
  };

  if (!enrollment.completed_date) {
    return (
      <div className="rounded-lg border border-dashed border-[#12305f] bg-[#06101f]/50 p-6 text-center">
        <Lock className="mx-auto mb-3 h-8 w-8 text-blue-200/30" />
        <p className="font-black text-blue-100/60">Complete the course to unlock certificate</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-purple-500/5 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FileText className="h-6 w-6 text-amber-400 mt-1" />
          <div>
            <h3 className="font-black text-white">Certificate of Completion</h3>
            <p className="text-sm text-blue-100/60 mt-1">
              Completed on {new Date(enrollment.completed_date).toLocaleDateString()}
              {enrollment.quiz_score && ` • Score: ${enrollment.quiz_score}%`}
            </p>
          </div>
        </div>
        <button
          onClick={generateCertificate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 px-4 py-2 text-amber-300 font-black hover:border-amber-500/80 transition disabled:opacity-50"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            <><Download className="h-4 w-4" /> Download</>
          )}
        </button>
      </div>
    </div>
  );
}