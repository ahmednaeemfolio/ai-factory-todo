import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { TodoItem, TodosService } from './todos.service';

class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'text must not be empty' })
  text!: string;
}

interface AuthenticatedRequest {
  user: {
    userId?: string;
    id?: string;
    sub?: string;
  };
}

@Controller('todos')
@UseGuards(AuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  listItems(@Req() request: AuthenticatedRequest): { items: TodoItem[] } {
    return { items: this.todosService.listItems(this.getUserId(request)) };
  }

  @Post()
  addItem(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateTodoDto,
  ): TodoItem {
    return this.todosService.addItem(this.getUserId(request), body.text);
  }

  private getUserId(request: AuthenticatedRequest): string {
    const userId = request.user.userId ?? request.user.id ?? request.user.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated request is missing a user identifier');
    }
    return userId;
  }
}
