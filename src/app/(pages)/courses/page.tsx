import { createClient } from "../../../../lib/supabase/server";

type Course = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  created_at: string;
};

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, description, url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);

    return (
      <main className="mx-auto max-w-4xl px-6 py-12 min-h-screen">
        <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
          Courses
        </h1>
        <p className="text-ink-soft">
          Unable to load courses right now.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 min-h-screen">
      <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
        Courses
      </h1>

      <p className="text-ink-soft mb-12">
        Courses that are taught by this Lab.
      </p>

      <div className="relative ml-2">
        {courses?.map((course, i) => (
          <div
            key={course.id}
            className="relative pl-8 pb-10 last:pb-0"
          >
            {i !== courses.length - 1 && (
              <div className="absolute left-0 top-2 bottom-0 w-px bg-ink/10" />
            )}

            <div className="absolute -left-1 top-2 w-2.5 h-2.5 rounded-full bg-red-primary border-2 border-paper" />

            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink leading-snug">
                    {course.title}
                  </h3>

                  {course.created_at && (
                    <p className="text-sm text-red-primary font-semibold mt-0.5">
                      {new Date(course.created_at).getFullYear()}
                    </p>
                  )}
                </div>
              </div>

              {course.description && (
                <p className="text-sm text-ink-soft mt-3 leading-relaxed">
                  {course.description}
                </p>
              )}

              {course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-red-primary font-semibold mt-4 hover:underline"
                >
                  View Course →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}