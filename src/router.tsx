import { createBrowserRouter } from 'react-router-dom'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { AgentChatPage } from '@/pages/AgentChatPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EditProjectPage } from '@/pages/EditProjectPage'
import { LoginPage } from '@/pages/LoginPage'
import { NewProjectPage } from '@/pages/NewProjectPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectHubPage } from '@/pages/ProjectHubPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'projects/new', element: <NewProjectPage /> },
      { path: 'projects/:id/edit', element: <EditProjectPage /> },
      { path: 'projects/:id/agents/:agentType', element: <AgentChatPage /> },
      { path: 'projects/:id', element: <ProjectHubPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
