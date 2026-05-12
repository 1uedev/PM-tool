// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ArtifactForm from "@/components/artifacts/ArtifactForm.jsx";

// ── Mocks ──────────────────────────────────────────────────────────────────

const { mockPush, mockBack, mockMutate } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockBack: vi.fn(),
  mockMutate: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn(), back: mockBack }),
}));

vi.mock("swr", () => ({ default: vi.fn(), mutate: mockMutate }));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("@/components/ai/AiSuggestButton.jsx", () => ({ default: () => null }));

// Minimal field stub — avoids Tiptap/browser deps, gives us something to interact with
vi.mock("@/components/artifacts/fields/index.js", () => ({
  FIELD_COMPONENTS: {
    USER_PERSONA: ({ fields, onChange, disabled }) => (
      <textarea
        data-testid="field-goals"
        value={fields.goals ?? ""}
        onChange={(e) => onChange("goals", e.target.value)}
        disabled={disabled}
        aria-label="Goals"
      />
    ),
  },
}));

// DirtyFormContext.js and ProjectRoleContext.js contain JSX in .js files.
// Vite 8 Oxc doesn't parse JSX in .js files, so we mock them using createElement.
vi.mock("@/lib/DirtyFormContext.js", async () => {
  const React = await import("react");
  const ctx = React.createContext({ isDirty: false, setDirty: () => {} });
  function DirtyFormProvider({ children }) {
    const [isDirty, setIsDirty] = React.useState(false);
    const setDirty = React.useCallback((v) => setIsDirty(v), []);
    return React.createElement(ctx.Provider, { value: { isDirty, setDirty } }, children);
  }
  return { DirtyFormProvider, useDirtyForm: () => React.useContext(ctx) };
});

vi.mock("@/lib/ProjectRoleContext.js", async () => {
  const React = await import("react");
  const ctx = React.createContext("VIEWER");
  return {
    ProjectRoleProvider: ({ role, children }) =>
      React.createElement(ctx.Provider, { value: role }, children),
    useProjectRole: () => React.useContext(ctx),
    hasRole: (userRole, required) => {
      const rank = { VIEWER: 0, EDITOR: 1, OWNER: 2 };
      return (rank[userRole] ?? 0) >= (rank[required] ?? 0);
    },
  };
});

// ── Helpers ────────────────────────────────────────────────────────────────

// Import mocked context hooks — these will resolve to our mock implementations
import { DirtyFormProvider, useDirtyForm } from "@/lib/DirtyFormContext.js";
import { ProjectRoleProvider } from "@/lib/ProjectRoleContext.js";

// Renders a dirty indicator inside the same DirtyFormProvider
function DirtyFlag() {
  const { isDirty } = useDirtyForm();
  return <span data-testid="dirty-flag">{isDirty ? "dirty" : "clean"}</span>;
}

function Wrapper({ role = "EDITOR", children }) {
  return (
    <ProjectRoleProvider role={role}>
      <DirtyFormProvider>
        <DirtyFlag />
        {children}
      </DirtyFormProvider>
    </ProjectRoleProvider>
  );
}

function renderForm({
  artifact = null,
  type = "USER_PERSONA",
  role = "EDITOR",
  onSaved = vi.fn(),
} = {}) {
  return render(
    <ArtifactForm
      artifact={artifact}
      type={type}
      projectId="p-1"
      onSaved={onSaved}
    />,
    { wrapper: ({ children }) => <Wrapper role={role}>{children}</Wrapper> }
  );
}

const ARTIFACT = {
  id: "a-1",
  type: "USER_PERSONA",
  title: "Alice",
  status: "DRAFT",
  fields: { goals: "world domination", name: "", painPoints: "", context: "" },
};

function mockFetch(ok, data, status = ok ? 200 : 400) {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok,
    status,
    json: async () => ok ? { data } : { error: data },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

// ── Create Mode ────────────────────────────────────────────────────────────

describe("ArtifactForm — Create Mode", () => {
  it("shows title input and create button", () => {
    renderForm();
    expect(screen.getByPlaceholderText(/nutzer-persona benennen/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /artefakt erstellen/i })).toBeInTheDocument();
  });

  it("shows status select in create mode", () => {
    renderForm();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("does not show AI suggest button in create mode", () => {
    renderForm();
    // AiSuggestButton is mocked to null; its rendered slot only appears in edit mode
    expect(screen.queryByTestId("ai-suggest")).not.toBeInTheDocument();
  });

  it("blocks submit and shows title error when title is empty", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /artefakt erstellen/i }));
    expect(screen.getByText(/titel ist erforderlich/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("POSTs to /api/projects/:id/artifacts and navigates on success", async () => {
    const user = userEvent.setup();
    mockFetch(true, { id: "a-new", type: "USER_PERSONA" }, 201);
    renderForm();
    await user.type(screen.getByPlaceholderText(/nutzer-persona benennen/i), "New Persona");
    await user.click(screen.getByRole("button", { name: /artefakt erstellen/i }));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/p-1/artifacts",
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("artifact=a-new"))
    );
  });

  it("shows global error on network failure", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));
    renderForm();
    await user.type(screen.getByPlaceholderText(/nutzer-persona benennen/i), "Test");
    await user.click(screen.getByRole("button", { name: /artefakt erstellen/i }));
    await waitFor(() =>
      expect(screen.getByText(/netzwerkfehler/i)).toBeInTheDocument()
    );
  });
});

// ── Edit Mode ──────────────────────────────────────────────────────────────

describe("ArtifactForm — Edit Mode", () => {
  it("pre-fills title and hides status select", () => {
    renderForm({ artifact: ARTIFACT });
    expect(screen.getByPlaceholderText(/nutzer-persona benennen/i)).toHaveValue("Alice");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows save button (not create)", () => {
    renderForm({ artifact: ARTIFACT });
    expect(screen.getByRole("button", { name: /^speichern$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /artefakt erstellen/i })).not.toBeInTheDocument();
  });

  it("marks dirty when title is changed", async () => {
    const user = userEvent.setup();
    renderForm({ artifact: ARTIFACT });
    expect(screen.getByTestId("dirty-flag")).toHaveTextContent("clean");
    await user.type(screen.getByPlaceholderText(/nutzer-persona benennen/i), " 2");
    expect(screen.getByTestId("dirty-flag")).toHaveTextContent("dirty");
  });

  it("marks dirty when a field is changed", async () => {
    const user = userEvent.setup();
    renderForm({ artifact: ARTIFACT });
    await user.clear(screen.getByTestId("field-goals"));
    await user.type(screen.getByTestId("field-goals"), "new goals");
    expect(screen.getByTestId("dirty-flag")).toHaveTextContent("dirty");
  });

  it("PATCHes correct URL and calls onSaved on success", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const updated = { ...ARTIFACT, title: "Alice V2" };
    mockFetch(true, updated);
    renderForm({ artifact: ARTIFACT, onSaved });
    await user.clear(screen.getByPlaceholderText(/nutzer-persona benennen/i));
    await user.type(screen.getByPlaceholderText(/nutzer-persona benennen/i), "Alice V2");
    await user.click(screen.getByRole("button", { name: /^speichern$/i }));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/p-1/artifacts/a-1",
        expect.objectContaining({ method: "PATCH" })
      )
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(updated));
  });

  it("does not include status in PATCH body (owned by ArtifactHeader)", async () => {
    const user = userEvent.setup();
    mockFetch(true, ARTIFACT);
    renderForm({ artifact: ARTIFACT });
    await user.click(screen.getByRole("button", { name: /^speichern$/i }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).not.toHaveProperty("status");
    expect(body).toHaveProperty("title");
    expect(body).toHaveProperty("fields");
  });

  it("clears dirty flag after successful save", async () => {
    const user = userEvent.setup();
    mockFetch(true, ARTIFACT);
    renderForm({ artifact: ARTIFACT });
    await user.type(screen.getByPlaceholderText(/nutzer-persona benennen/i), " x");
    expect(screen.getByTestId("dirty-flag")).toHaveTextContent("dirty");
    await user.click(screen.getByRole("button", { name: /^speichern$/i }));
    await waitFor(() =>
      expect(screen.getByTestId("dirty-flag")).toHaveTextContent("clean")
    );
  });

  it("shows '✓ Gespeichert' briefly after successful save", async () => {
    const user = userEvent.setup();
    mockFetch(true, ARTIFACT);
    renderForm({ artifact: ARTIFACT });
    await user.click(screen.getByRole("button", { name: /^speichern$/i }));
    await waitFor(() =>
      expect(screen.getByText(/gespeichert/i)).toBeInTheDocument()
    );
  });

  it("shows field-level error from API response", async () => {
    const user = userEvent.setup();
    mockFetch(false, { code: "VALIDATION_ERROR", message: "Val error", details: { title: ["Titel zu kurz"] } });
    renderForm({ artifact: ARTIFACT });
    await user.click(screen.getByRole("button", { name: /^speichern$/i }));
    await waitFor(() =>
      expect(screen.getByText(/titel zu kurz/i)).toBeInTheDocument()
    );
  });

  it("shows global error when API returns no details", async () => {
    const user = userEvent.setup();
    mockFetch(false, { code: "SERVER_ERROR", message: "Interner Fehler" }, 500);
    renderForm({ artifact: ARTIFACT });
    await user.click(screen.getByRole("button", { name: /^speichern$/i }));
    await waitFor(() =>
      expect(screen.getByText(/interner fehler/i)).toBeInTheDocument()
    );
  });

  it("resets form and clears dirty when artifact.id changes", async () => {
    const user = userEvent.setup();
    const artifact2 = { ...ARTIFACT, id: "a-2", title: "Bob", fields: { goals: "", name: "", painPoints: "", context: "" } };
    const { rerender } = renderForm({ artifact: ARTIFACT });

    await user.type(screen.getByPlaceholderText(/nutzer-persona benennen/i), " dirty");
    expect(screen.getByTestId("dirty-flag")).toHaveTextContent("dirty");

    rerender(
      <ArtifactForm artifact={artifact2} type="USER_PERSONA" projectId="p-1" onSaved={vi.fn()} />
    );

    await waitFor(() =>
      expect(screen.getByPlaceholderText(/nutzer-persona benennen/i)).toHaveValue("Bob")
    );
    await waitFor(() =>
      expect(screen.getByTestId("dirty-flag")).toHaveTextContent("clean")
    );
  });
});

// ── Role-based access ──────────────────────────────────────────────────────

describe("ArtifactForm — VIEWER role", () => {
  it("disables title input for VIEWER", () => {
    renderForm({ artifact: ARTIFACT, role: "VIEWER" });
    expect(screen.getByPlaceholderText(/nutzer-persona benennen/i)).toBeDisabled();
  });

  it("disables field component for VIEWER", () => {
    renderForm({ artifact: ARTIFACT, role: "VIEWER" });
    expect(screen.getByTestId("field-goals")).toBeDisabled();
  });

  it("hides save button for VIEWER", () => {
    renderForm({ artifact: ARTIFACT, role: "VIEWER" });
    expect(screen.queryByRole("button", { name: /speichern/i })).not.toBeInTheDocument();
  });
});
