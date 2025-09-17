import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Activity,
  Folder,
  MoreHorizontal,
} from "lucide-react";
import type { ProjectResponse, BoardSummaryResponse } from "../types";

// Mock data for development
const mockProjects: ProjectResponse[] = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description: "Building a modern e-commerce platform with React and Node.js",
    ownerId: 1,
  },
  {
    id: 2,
    name: "Mobile App Redesign",
    description:
      "Redesigning the mobile application with a modern UI/UX approach",
    ownerId: 1,
  },
  {
    id: 3,
    name: "Data Analytics Dashboard",
    description:
      "Creating comprehensive analytics dashboard for business insights",
    ownerId: 1,
  },
];

const mockBoards: BoardSummaryResponse[] = [
  {
    id: 1,
    name: "Frontend Development",
    description: "UI/UX and frontend implementation tasks",
    isPublic: false,
    memberCount: 4,
    cardCount: 12,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Backend APIs",
    description: "API development and database design",
    isPublic: true,
    memberCount: 3,
    cardCount: 8,
    createdAt: "2024-01-20T14:30:00Z",
  },
];

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [boards, setBoards] = useState<BoardSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading with mock data
    setTimeout(() => {
      setProjects(mockProjects);
      setBoards(mockBoards);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalProjects: projects.length,
    totalBoards: boards.length,
    totalMembers: projects.length * 2, // Rough estimate since memberCount not available
    totalTasks: boards.reduce((acc, b) => acc + (b.cardCount || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, Developer!
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
              New Project
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
              New Board
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<Folder className="h-6 w-6" />}
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <StatsCard
          title="Active Boards"
          value={stats.totalBoards}
          icon={<Calendar className="h-6 w-6" />}
          trend="+8%"
          trendUp={true}
          color="green"
        />
        <StatsCard
          title="Team Members"
          value={stats.totalMembers}
          icon={<Users className="h-6 w-6" />}
          trend="+2"
          trendUp={true}
          color="purple"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<CheckCircle className="h-6 w-6" />}
          trend="+24%"
          trendUp={true}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Projects
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started.
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <ProjectItem key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Create New Project</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-medium">Create New Board</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Invite Team Members</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Project Alpha</span> was
                    created
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Board setup</span> completed
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">John Doe</span> joined the
                    team
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Boards */}
      {boards.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Boards
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.slice(0, 6).map((board) => (
              <BoardItem key={board.id} board={board} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  color: "blue" | "green" | "purple" | "orange";
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  color,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const trendClasses = {
    blue: trendUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50",
    green: trendUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50",
    purple: trendUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50",
    orange: trendUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendClasses[color]}`}
        >
          <TrendingUp className={`h-3 w-3 ${trendUp ? "" : "rotate-180"}`} />
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </h3>
        <p className="text-gray-600 text-sm mt-1">{title}</p>
      </div>
    </div>
  );
};

interface ProjectItemProps {
  project: ProjectResponse;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Folder className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
          <p className="text-sm text-gray-600 truncate">
            {project.description}
          </p>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />0 members
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />0 boards
            </div>
            <div className="text-xs text-gray-500">Created recently</div>
          </div>
        </div>
      </div>
      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

interface BoardItemProps {
  board: BoardSummaryResponse;
}

const BoardItem: React.FC<BoardItemProps> = ({ board }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users className="h-3 w-3" />
          {board.memberCount}
        </div>
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{board.name}</h4>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {board.description}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>0 columns</span>
        <span>{new Date(board.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default DashboardPage;
