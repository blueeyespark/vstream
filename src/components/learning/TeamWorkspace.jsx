import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, FileUp, MessageSquare, CheckCircle2, Trash2 } from "lucide-react";

export default function TeamWorkspace({ courseId, enrollmentId }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["team-projects", courseId],
    queryFn: () => base44.entities.TeamProject.filter({ course_id: courseId })
  });

  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.TeamProject.create({
        course_id: courseId,
        enrollment_id: enrollmentId,
        project_name: projectName,
        description: projectDesc,
        team_lead_email: user.email,
        team_members: [{ email: user.email, name: user.full_name || user.email, role: "lead", joined_date: new Date().toISOString() }],
        status: "planning"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-projects", courseId] });
      setProjectName("");
      setProjectDesc("");
      setShowCreateForm(false);
    }
  });

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-[#00c8ff]" /> Team Projects
        </h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 rounded-lg bg-[#1e78ff]/20 border border-[#1e78ff]/50 px-3 py-2 text-sm font-black text-[#00c8ff] hover:bg-[#1e78ff]/30 transition"
        >
          <Plus className="h-4 w-4" /> Create Project
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-lg border border-[#1a3a60] bg-[#03080f] p-4">
          <input
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full mb-2 rounded-lg border border-[#12305f] bg-[#06101f] px-3 py-2 text-white outline-none placeholder:text-blue-200/30"
          />
          <textarea
            placeholder="Project description"
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
            rows={2}
            className="w-full mb-3 rounded-lg border border-[#12305f] bg-[#06101f] px-3 py-2 text-white outline-none placeholder:text-blue-200/30 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => createProjectMutation.mutate()}
              disabled={!projectName.trim()}
              className="flex-1 rounded-lg bg-[#1e78ff] px-4 py-2 text-white font-black hover:bg-[#3d8fff] transition disabled:opacity-50"
            >
              Create Project
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg border border-[#12305f] px-4 py-2 text-blue-100 font-black hover:bg-[#12305f]/30 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {projects.length === 0 ? (
          <p className="text-center text-sm text-blue-100/50 py-6">No projects yet. Create one to start collaborating!</p>
        ) : (
          projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className="text-left rounded-lg border border-[#1a3a60] bg-[#03080f] p-4 hover:border-[#1e78ff]/40 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-black text-white">{p.project_name}</p>
                  <p className="text-xs text-blue-100/50 mt-1">{p.description}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${
                  p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                  p.status === 'in_progress' ? 'bg-[#1e78ff]/20 text-[#00c8ff]' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-blue-100/50">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.team_members?.length || 0} members</span>
                <span className="flex items-center gap-1"><FileUp className="h-3 w-3" /> {p.files?.length || 0} files</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ProjectDetail({ project, onBack }) {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const updated = {
        ...project,
        team_members: [...project.team_members, {
          email: newMemberEmail,
          name: newMemberEmail.split('@')[0],
          role: "contributor",
          joined_date: new Date().toISOString()
        }]
      };
      await base44.entities.TeamProject.update(project.id, updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-projects"] });
      setNewMemberEmail("");
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        url: file_url,
        uploaded_by: (await base44.auth.me()).email,
        uploaded_at: new Date().toISOString(),
        version: 1
      };

      const updated = {
        ...project,
        files: [...(project.files || []), newFile]
      };
      await base44.entities.TeamProject.update(project.id, updated);
      queryClient.invalidateQueries({ queryKey: ["team-projects"] });
    } catch (e) {
      console.error("Upload failed", e);
    }
    setUploadingFile(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm font-black text-[#00c8ff] hover:underline">&larr; Back to Projects</button>
      
      <div className="rounded-lg border border-[#1a3a60] bg-[#03080f] p-4">
        <h3 className="font-black text-white text-lg mb-2">{project.project_name}</h3>
        <p className="text-sm text-blue-100/70 mb-3">{project.description}</p>
        <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-black ${
          project.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
          project.status === 'in_progress' ? 'bg-[#1e78ff]/20 text-[#00c8ff]' :
          'bg-amber-500/20 text-amber-300'
        }`}>
          {project.status}
        </span>
      </div>

      {/* Team Members */}
      <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
        <h4 className="font-black text-white mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" /> Team Members
        </h4>
        <div className="space-y-2 mb-3">
          {project.team_members?.map((member) => (
            <div key={member.email} className="flex items-center justify-between rounded-lg border border-[#1a3a60] bg-[#03080f] p-2">
              <div>
                <p className="text-sm font-black text-white">{member.name}</p>
                <p className="text-xs text-blue-100/50">{member.email}</p>
              </div>
              <span className="text-xs font-black px-2 py-1 rounded-full bg-[#1e78ff]/20 text-[#00c8ff]">{member.role}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            placeholder="Add member email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="flex-1 rounded-lg border border-[#12305f] bg-[#06101f] px-3 py-2 text-white outline-none placeholder:text-blue-200/30"
          />
          <button
            onClick={() => addMemberMutation.mutate()}
            disabled={!newMemberEmail.includes("@")}
            className="rounded-lg bg-[#1e78ff]/20 border border-[#1e78ff]/50 px-4 py-2 text-[#00c8ff] font-black hover:bg-[#1e78ff]/30 transition disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Files */}
      <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
        <h4 className="font-black text-white mb-3 flex items-center gap-2">
          <FileUp className="h-4 w-4" /> Shared Files
        </h4>
        <label className="block mb-3">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploadingFile}
            className="hidden"
          />
          <span className="cursor-pointer rounded-lg border border-dashed border-[#12305f] bg-[#03080f] py-4 px-3 text-center text-sm font-black text-[#00c8ff] hover:border-[#1e78ff]/50 transition">
            {uploadingFile ? "Uploading..." : "Click to upload or drag files"}
          </span>
        </label>
        <div className="space-y-2">
          {project.files?.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-[#1a3a60] bg-[#03080f] p-3 hover:border-[#1e78ff]/40 transition"
            >
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">{file.name}</p>
                <p className="text-xs text-blue-100/50">{file.uploaded_by}</p>
              </div>
              <span className="text-[10px] text-blue-100/40 shrink-0">v{file.version}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}