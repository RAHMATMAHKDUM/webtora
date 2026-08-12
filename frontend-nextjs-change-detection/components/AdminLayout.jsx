export default function AdminLayout({ title, children }) {
    return (
        <div>
            {title && (
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                    {title}
                </h1>
            )}
            {children}
        </div>
    );
}