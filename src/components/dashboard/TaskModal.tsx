"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import type { Task } from "@/types/task";

type TaskModalProps = {
    task: Task;
    onClose: () => void;
    onUpdateTask: (updatedTask: Task) => void;
};

export default function TaskModal({ task, onClose, onUpdateTask }: TaskModalProps) {
    const [uploading, setUploading] = useState(false);
    const [summaryUrl, setSummaryUrl] = useState<string | null>(task.summary_url ?? null);
    const supabase = createClient();

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_MIME_TYPES = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
    ];

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Validate File Size
        if (file.size > MAX_FILE_SIZE) {
            alert("File is too large. Please upload a file smaller than 5 MB.");
            e.target.value = ""; // Reset input
            return;
        }

        // 2. Validate MIME Type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            alert("Invalid file format. Please upload a PDF, Word document, PNG, or JPG.");
            e.target.value = ""; // Reset input
            return;
        }

        setUploading(true);

        try {
            const filePath = `summaries/${task.id}/${Date.now()}_${file.name}`;
            const { error: uploadErr } = await supabase.storage
                .from("task-summaries")
                .upload(filePath, file, { upsert: true, contentType: file.type });

            if (uploadErr) throw uploadErr;

            const { data } = supabase.storage.from("task-summaries").getPublicUrl(filePath);

            const { error: updateErr } = await supabase
                .from("tasks")
                .update({ summary_url: data.publicUrl })
                .eq("id", task.id);

            if (updateErr) throw updateErr;

            const updated = { ...task, summary_url: data.publicUrl };
            setSummaryUrl(data.publicUrl);
            onUpdateTask(updated);
        } catch (err: any) {
            alert(err.message || "Failed to upload summary file.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-ink-soft hover:text-ink text-sm font-bold cursor-pointer"
                >
                    ✕
                </button>

                <h2 className="font-serif text-2xl font-bold text-red-primary">{task.title}</h2>

                {task.description && (
                    <p className="text-sm text-ink-soft whitespace-pre-wrap">{task.description}</p>
                )}

                <div className="text-xs space-y-1 text-ink-soft">
                    <p>
                        <strong className="text-ink">Frequency:</strong>{" "}
                        <span className="capitalize">{task.frequency.replace("_", " ")}</span>
                    </p>
                    {task.due_date && (
                        <p>
                            <strong className="text-ink">Due Date:</strong> {task.due_date}
                        </p>
                    )}
                </div>

                {/* Results Summary Section */}
                <div className="pt-3 border-t border-ink/10">
                    <label className="block text-xs font-semibold text-ink mb-2">
                        Results Summary Document
                    </label>

                    {summaryUrl ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">
                            <a
                                href={summaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-800 font-semibold hover:underline truncate max-w-[200px]"
                            >
                                📄 View Summary File
                            </a>
                            <label className="text-ink-soft hover:text-ink cursor-pointer text-[11px] font-medium underline">
                                Replace
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    ) : (
                        <label className="flex items-center justify-center gap-2 border border-dashed border-ink/20 hover:border-red-primary/50 bg-ink/5 hover:bg-red-primary/5 rounded-lg p-3 cursor-pointer transition-colors text-xs text-ink-soft font-medium">
                            {uploading ? "Uploading file..." : "📁 Upload Summary (PDF / Doc)"}
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.png,.jpg"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}