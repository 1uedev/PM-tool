import ProjectForm from "@/components/projects/ProjectForm.jsx";

export const metadata = { title: "Neues Projekt — PM Copilot" };

export default function NewProjectPage() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
        <h1 className="text-base font-semibold text-gray-900">Neues Projekt</h1>
      </header>
      <main className="flex-1 p-6">
        <ProjectForm />
      </main>
    </div>
  );
}
