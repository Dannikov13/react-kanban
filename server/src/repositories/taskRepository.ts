import { pool } from '../db.js';
import { CreateTaskData, Task, UpdateTaskPositionData } from '../types/task.js';

export class TaskRepository {
  async findAll(): Promise<Task[]> {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY status, position',
    );

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      dueDate: row.due_date !== null ? Number(row.due_date) : undefined,
      priority: row.priority,
      status: row.status,
      createdAt: Number(row.created_at),
      position: row.position,
    }));
  }

  async create(data: CreateTaskData): Promise<Task> {
    const positionResult = await pool.query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS position
       FROM tasks
       WHERE status = $1`,
      [data.status],
    );

    const position = Number(positionResult.rows[0].position);

    const task: Task = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: Date.now(),
      position,
    };

    await pool.query(
      `INSERT INTO tasks (id,
                          title,
                          description,
                          due_date,
                          priority,
                          status,
                          created_at,
                          position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        task.id,
        task.title,
        task.description ?? null,
        task.dueDate ?? null,
        task.priority,
        task.status,
        task.createdAt,
        task.position,
      ],
    );

    return task;
  }

  async update(id: string, data: CreateTaskData): Promise<Task | null> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const currentResult = await client.query(
        `SELECT *
         FROM tasks
         WHERE id = $1`,
        [id],
      );

      if (currentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const currentTask = currentResult.rows[0];

      const oldStatus = currentTask.status;
      const oldPosition = Number(currentTask.position);

      let position = oldPosition;

      if (oldStatus !== data.status) {
        const positionResult = await client.query(
          `SELECT COALESCE(MAX(position), -1) + 1 AS position
           FROM tasks
           WHERE status = $1`,
          [data.status],
        );

        position = Number(positionResult.rows[0].position);

        await client.query(
          `UPDATE tasks
           SET position = position - 1
           WHERE status = $1
             AND position > $2`,
          [oldStatus, oldPosition],
        );
      }

      const result = await client.query(
        `UPDATE tasks
         SET title       = $1,
             description = $2,
             due_date    = $3,
             priority    = $4,
             status      = $5,
             position    = $6
         WHERE id = $7 RETURNING *`,
        [
          data.title,
          data.description ?? null,
          data.dueDate ?? null,
          data.priority,
          data.status,
          position,
          id,
        ],
      );

      await client.query('COMMIT');

      const row = result.rows[0];

      return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        dueDate: row.due_date !== null ? Number(row.due_date) : undefined,
        priority: row.priority,
        status: row.status,
        createdAt: Number(row.created_at),
        position: Number(row.position),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE
       FROM tasks
       WHERE id = $1 RETURNING id`,
      [id],
    );

    return result.rows.length > 0;
  }

  async updatePositions(tasks: UpdateTaskPositionData[]): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const task of tasks) {
        await client.query(
          `UPDATE tasks
           SET status   = $1,
               position = $2
           WHERE id = $3`,
          [task.status, task.position, task.id],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
