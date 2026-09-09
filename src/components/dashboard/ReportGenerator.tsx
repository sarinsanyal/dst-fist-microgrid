"use client";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  frequency: string;
  due_date?: string | null;
  summary_url?: string | null;
};

type Profile = {
  full_name?: string | null;
  specialties?: string[] | null;
};

export default function ReportGenerator({
  tasks,
  profile,
}: {
  tasks: Task[];
  profile: Profile;
}) {
  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedGeneratedAt = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const formatDueDate = (dateStr?: string | null) => {
      if (!dateStr) return "N/A";
      // Appending T00:00:00 prevents timezone shift offset issues with date-only strings
      return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DST FIST Summary Report - ${profile?.full_name || "User"} - ${formattedGeneratedAt}</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; padding: 10px; line-height: 1.5; }
            .header { border-bottom: 2px solid #b91c1c; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 700; color: #b91c1c; margin: 0 0 4px 0; }
            .meta { font-size: 13px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; font-weight: 600; color: #374151; }
            td { border: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; vertical-align: top; }
            tr:nth-child(even) { background-color: #fcfcfd; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
            .badge-completed { background-color: #d1fae5; color: #065f46; }
            .badge-todo { background-color: #fef3c7; color: #92400e; }
            .badge-freq { background-color: #f3f4f6; color: #374151; }
            .desc { font-size: 11px; color: #4b5563; white-space: pre-wrap; margin-top: 2px; }
            .summary-link { color: #2563eb; font-weight: 500; text-decoration: underline; }
            @media print {
              a { text-decoration: none; color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Microgrid Lab — Task Summary Report</h1>
            <div class="meta">
              <strong>User:</strong> ${profile?.full_name || "N/A"} &nbsp;|&nbsp;
              <strong>Generated:</strong> ${formattedGeneratedAt}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Task & Description</th>
                <th style="width: 15%;">Frequency</th>
                <th style="width: 15%;">Status</th>
                <th style="width: 15%;">Due Date</th>
                <th style="width: 30%;">Summary Document</th>
              </tr>
            </thead>
            <tbody>
              ${
                tasks.length === 0
                  ? `<tr><td colspan="5" style="text-align: center; color: #6b7280; padding: 20px;">No tasks found.</td></tr>`
                  : tasks
                      .map(
                        (t) => `
                <tr>
                  <td>
                    <strong>${t.title}</strong>
                    ${t.description ? `<div class="desc">${t.description}</div>` : ""}
                  </td>
                  <td>
                    <span class="badge badge-freq">${t.frequency.replace("_", " ")}</span>
                  </td>
                  <td>
                    <span class="badge ${t.status === "completed" ? "badge-completed" : "badge-todo"}">
                      ${t.status === "completed" ? "Completed" : "To-Do"}
                    </span>
                  </td>
                  <td>${formatDueDate(t.due_date)}</td>
                  <td>
                    ${
                      t.summary_url
                        ? `<a href="${t.summary_url}" target="_blank" class="summary-link"> View Attachment</a>`
                        : `<span style="color: #9ca3af;">No attachment</span>`
                    }
                  </td>
                </tr>
              `
                      )
                      .join("")
              }
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content load before triggering native print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <button
      type="button"
      onClick={handlePrintReport}
      className="bg-ink/5 hover:bg-ink/10 text-ink text-xs font-semibold px-3 py-2 rounded-lg border border-ink/10 flex items-center gap-1.5 cursor-pointer"
    >
      Export PDF Report
    </button>
  );
}