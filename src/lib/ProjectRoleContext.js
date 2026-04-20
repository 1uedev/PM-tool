"use client";

import { createContext, useContext } from "react";

const ProjectRoleContext = createContext("VIEWER");

export function ProjectRoleProvider({ role, children }) {
  return (
    <ProjectRoleContext.Provider value={role}>
      {children}
    </ProjectRoleContext.Provider>
  );
}

export function useProjectRole() {
  return useContext(ProjectRoleContext);
}

// Helper: returns true if the user's role meets the minimum required role
const ROLE_RANK = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

export function hasRole(userRole, requiredRole) {
  return (ROLE_RANK[userRole] ?? 0) >= (ROLE_RANK[requiredRole] ?? 0);
}
