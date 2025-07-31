import { DynamoDB } from 'aws-sdk';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  dueDate?: string;
  tags?: string[];
  attachments?: string[];
  comments?: Comment[];
  userId: string; // Owner of the task
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  userId?: string;
  search?: string;
  dueDate?: string;
}

export class TaskModel {
  private dynamodb: DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.dynamodb = new DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1',
      ...(process.env.NODE_ENV === 'development' && {
        endpoint: 'http://localhost:8000', // Local DynamoDB for development
        accessKeyId: 'local',
        secretAccessKey: 'local'
      })
    });
    this.tableName = process.env.TASKS_TABLE_NAME || 'serverless-task-manager-tasks';
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    };

    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: task,
      ConditionExpression: 'attribute_not_exists(id)'
    };

    try {
      await this.dynamodb.put(params).promise();
      return task;
    } catch (error: any) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('Task with this ID already exists');
      }
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async getTaskById(id: string, userId: string): Promise<Task | null> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: { id, userId }
    };

    try {
      const result = await this.dynamodb.get(params).promise();
      return result.Item as Task || null;
    } catch (error: any) {
      throw new Error(`Failed to get task: ${error.message}`);
    }
  }

  async getAllTasks(userId: string, filters?: TaskFilters): Promise<Task[]> {
    let params: DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableName,
      IndexName: 'UserIdIndex', // GSI for querying by userId
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    // Apply filters
    if (filters) {
      const filterExpressions: string[] = [];
      const expressionAttributeNames: { [key: string]: string } = {};

      if (filters.status) {
        filterExpressions.push('#status = :status');
        expressionAttributeNames['#status'] = 'status';
        params.ExpressionAttributeValues![':status'] = filters.status;
      }

      if (filters.priority) {
        filterExpressions.push('#priority = :priority');
        expressionAttributeNames['#priority'] = 'priority';
        params.ExpressionAttributeValues![':priority'] = filters.priority;
      }

      if (filters.assignedTo) {
        filterExpressions.push('#assignedTo = :assignedTo');
        expressionAttributeNames['#assignedTo'] = 'assignedTo';
        params.ExpressionAttributeValues![':assignedTo'] = filters.assignedTo;
      }

      if (filters.search) {
        filterExpressions.push('contains(#title, :search) OR contains(#description, :search)');
        expressionAttributeNames['#title'] = 'title';
        expressionAttributeNames['#description'] = 'description';
        params.ExpressionAttributeValues![':search'] = filters.search;
      }

      if (filters.dueDate) {
        filterExpressions.push('#dueDate <= :dueDate');
        expressionAttributeNames['#dueDate'] = 'dueDate';
        params.ExpressionAttributeValues![':dueDate'] = filters.dueDate;
      }

      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(' AND ');
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
    }

    try {
      const result = await this.dynamodb.query(params).promise();
      return (result.Items || []) as Task[];
    } catch (error: any) {
      throw new Error(`Failed to get tasks: ${error.message}`);
    }
  }

  async updateTask(id: string, userId: string, updates: Partial<Task>): Promise<Task> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    // Build update expression
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'userId' && key !== 'createdAt') {
        const attributeName = `#${key}`;
        const attributeValue = `:${key}`;
        
        updateExpressions.push(`${attributeName} = ${attributeValue}`);
        expressionAttributeNames[attributeName] = key;
        expressionAttributeValues[attributeValue] = updates[key as keyof Task];
      }
    });

    // Always update the updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.tableName,
      Key: { id, userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await this.dynamodb.update(params).promise();
      return result.Attributes as Task;
    } catch (error: any) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('Task not found or access denied');
      }
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      Key: { id, userId },
      ConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    try {
      await this.dynamodb.delete(params).promise();
    } catch (error: any) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('Task not found or access denied');
      }
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async addComment(taskId: string, userId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Task> {
    const newComment: Comment = {
      ...comment,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.tableName,
      Key: { id: taskId, userId },
      UpdateExpression: 'SET comments = list_append(if_not_exists(comments, :empty_list), :comment)',
      ExpressionAttributeValues: {
        ':comment': [newComment],
        ':empty_list': []
      },
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await this.dynamodb.update(params).promise();
      return result.Attributes as Task;
    } catch (error: any) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  async getTasksByStatus(userId: string, status: string): Promise<Task[]> {
    return this.getAllTasks(userId, { status });
  }

  async getTasksByPriority(userId: string, priority: string): Promise<Task[]> {
    return this.getAllTasks(userId, { priority });
  }

  async searchTasks(userId: string, searchTerm: string): Promise<Task[]> {
    return this.getAllTasks(userId, { search: searchTerm });
  }

  async getOverdueTasks(userId: string): Promise<Task[]> {
    const now = new Date().toISOString();
    return this.getAllTasks(userId, { dueDate: now });
  }

  async getTaskStatistics(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    const tasks = await this.getAllTasks(userId);
    const now = new Date();

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
      ).length
    };
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 