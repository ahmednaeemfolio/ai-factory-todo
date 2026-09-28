import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface TodoItem {
  id: string;
  text: string;
  createdAt: Date;
}

@Injectable()
export class TodosService {
  private readonly itemsByUser = new Map<string, TodoItem[]>();

  addItem(userId: string, text: string): TodoItem {
    const item: TodoItem = {
      id: randomUUID(),
      text,
      createdAt: new Date(),
    };
    const items = this.itemsByUser.get(userId) ?? [];
    items.push(item);
    this.itemsByUser.set(userId, items);
    return item;
  }

  listItems(userId: string): TodoItem[] {
    return [...(this.itemsByUser.get(userId) ?? [])];
  }
}
