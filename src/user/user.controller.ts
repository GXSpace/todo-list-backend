import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { TodoDeleteDto, TodoDto, TodoPatchDto } from './ dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user);
  }

  @Post('todos')
  createTodo(@GetUser() user: User, @Body() todo: TodoDto) {
    return this.userService.createTodo(user, todo);
  }

  @Get('todos')
  getTodos(@GetUser() user: User) {
    return this.userService.getTodos(user);
  }

  @Patch('todos/:id')
  editTodo(
    @GetUser() user: User,
    @Param('id') todoId: string,
    @Body() todo: TodoPatchDto,
  ) {
    return this.userService.editTodo(user, todoId, todo);
  }

  @Delete('todos')
  deleteTodos(@GetUser() user: User, @Body() ids: TodoDeleteDto) {
    return this.userService.deleteTodos(user, ids);
  }
}
