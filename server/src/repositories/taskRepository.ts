import { pool } from '../db.js';
import { CreateTaskData, Task } from '../types/task.js';

export class TaskRepository {
  async findAll(): Promise<Task[]> {
    const result = await pool.query('SELECT * FROM tasks');

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      dueDate: row.due_date !== null ? Number(row.due_date) : undefined,
      priority: row.priority,
      status: row.status,
      createdAt: Number(row.created_at),
    }));
  }

  async create(data: CreateTaskData): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: Date.now(),
    };

    await pool.query(
      `INSERT INTO tasks (
        id,
        title,
        description,
        due_date,
        priority,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        task.id,
        task.title,
        task.description ?? null,
        task.dueDate ?? null,
        task.priority,
        task.status,
        task.createdAt,
      ],
    );

    return task;
  }

  async update(id: string, data: CreateTaskData): Promise<Task> {
    const result = await pool.query(
      `UPDATE tasks
       SET
         title = $1,
         description = $2,
         due_date = $3,
         priority = $4,
         status = $5
       WHERE id = $6
       RETURNING *`,
      [
        data.title,
        data.description ?? null,
        data.dueDate ?? null,
        data.priority,
        data.status,
        id,
      ],
    );

    const row = result.rows[0];

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      dueDate: row.due_date !== null ? Number(row.due_date) : undefined,
      priority: row.priority,
      status: row.status,
      createdAt: Number(row.created_at),
    };
  }

  async delete(id: string): Promise<void> {
    await pool.query(
      `DELETE FROM tasks
     WHERE id = $1`,
      [id],
    );
  }
}
