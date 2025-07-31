import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

interface PriorityDistribution {
  low: number;
  medium: number;
  high: number;
}

const TaskAnalytics: React.FC = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const [statistics, setStatistics] = useState<TaskStatistics>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution>({
    low: 0,
    medium: 0,
    high: 0,
  });

  useEffect(() => {
    calculateStatistics();
  }, [tasks]);

  const calculateStatistics = () => {
    const now = new Date();
    
    const stats: TaskStatistics = {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
      overdue: tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
      ).length,
    };

    const priorityDist: PriorityDistribution = {
      low: tasks.filter(task => task.priority === 'low').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      high: tasks.filter(task => task.priority === 'high').length,
    };

    setStatistics(stats);
    setPriorityDistribution(priorityDist);
  };

  const getCompletionRate = () => {
    if (statistics.total === 0) return 0;
    return Math.round((statistics.completed / statistics.total) * 100);
  };

  const getOverdueRate = () => {
    if (statistics.total === 0) return 0;
    return Math.round((statistics.overdue / statistics.total) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="task-analytics">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Task Analytics Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{getCompletionRate()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Rate</p>
              <p className="text-2xl font-bold text-gray-900">{getOverdueRate()}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-green-500 mr-3`}></div>
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">{statistics.completed}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({statistics.total > 0 ? Math.round((statistics.completed / statistics.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-blue-500 mr-3`}></div>
                <span className="text-sm font-medium text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">{statistics.inProgress}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({statistics.total > 0 ? Math.round((statistics.inProgress / statistics.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-yellow-500 mr-3`}></div>
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">{statistics.pending}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({statistics.total > 0 ? Math.round((statistics.pending / statistics.total) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Priority Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-red-500 mr-3`}></div>
                <span className="text-sm font-medium text-gray-700">High Priority</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">{priorityDistribution.high}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({statistics.total > 0 ? Math.round((priorityDistribution.high / statistics.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-yellow-500 mr-3`}></div>
                <span className="text-sm font-medium text-gray-700">Medium Priority</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">{priorityDistribution.medium}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({statistics.total > 0 ? Math.round((priorityDistribution.medium / statistics.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-green-500 mr-3`}></div>
                <span className="text-sm font-medium text-gray-700">Low Priority</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">{priorityDistribution.low}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({statistics.total > 0 ? Math.round((priorityDistribution.low / statistics.total) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">{task.title}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(task.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-500 text-center py-4">No tasks found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics; 