export default function BlogPage() {
  return (
    <section className="section-padding min-h-[70vh] bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">Blog</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">Insights and writing</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
          This section is ready for long-form posts on analytics, automation, dashboards, and AI delivery.
        </p>
      </div>
    </section>
  );
}
