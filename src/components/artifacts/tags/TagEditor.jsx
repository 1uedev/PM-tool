"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { X, Plus, Tag } from "lucide-react";
import { useProjectRole, hasRole } from "@/lib/ProjectRoleContext.js";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((d) => d.data ?? []);

export default function TagEditor({ artifactId, projectId }) {
  const role = useProjectRole();
  const canEdit = hasRole(role, "EDITOR");

  const { data: assignedTags = [], mutate: mutateAssigned } = useSWR(
    `/api/projects/${projectId}/artifacts/${artifactId}/tags`,
    fetcher
  );
  const { data: allTags = [], mutate: mutateAll } = useSWR(
    `/api/projects/${projectId}/tags`,
    fetcher
  );

  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const assignedIds = new Set(assignedTags.map((t) => t.id));
  const filtered = allTags.filter(
    (t) => !assignedIds.has(t.id) && t.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  async function addTag(tagId) {
    await fetch(`/api/projects/${projectId}/artifacts/${artifactId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    });
    mutateAssigned();
    setInputValue("");
    setShowDropdown(false);
  }

  async function createAndAdd(name) {
    const res = await fetch(`/api/projects/${projectId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return;
    const { data: tag } = await res.json();
    await fetch(`/api/projects/${projectId}/artifacts/${artifactId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId: tag.id }),
    });
    mutateAll();
    mutateAssigned();
    setInputValue("");
    setShowDropdown(false);
  }

  async function removeTag(tagId) {
    await fetch(
      `/api/projects/${projectId}/artifacts/${artifactId}/tags?tagId=${tagId}`,
      { method: "DELETE" }
    );
    mutateAssigned();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const exact = allTags.find((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase());
      if (exact && !assignedIds.has(exact.id)) {
        addTag(exact.id);
      } else if (!exact) {
        createAndAdd(inputValue.trim());
      }
    }
    if (e.key === "Escape") setShowDropdown(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Tag className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
        {assignedTags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
          >
            {tag.name}
            {canEdit && (
              <button
                onClick={() => removeTag(tag.id)}
                className="ml-0.5 rounded-full text-blue-500 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {canEdit && (
          <div className="relative">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="+ Tag"
              className="w-24 rounded-full border border-dashed border-gray-300 bg-transparent px-2 py-0.5 text-xs text-gray-500 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:text-gray-900"
            />
            {showDropdown && (filtered.length > 0 || (inputValue.trim() && !allTags.find((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()))) && (
              <div className="absolute left-0 top-6 z-20 min-w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {filtered.map((tag) => (
                  <button
                    key={tag.id}
                    onMouseDown={() => addTag(tag.id)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <span>{tag.name}</span>
                    <span className="ml-auto text-gray-400">{tag.count}</span>
                  </button>
                ))}
                {inputValue.trim() && !allTags.find((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
                  <button
                    onMouseDown={() => createAndAdd(inputValue.trim())}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-3 w-3" />
                    „{inputValue.trim()}" erstellen
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
