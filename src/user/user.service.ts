import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'prisma-error-enum';
import { PrismaService } from '../prisma/prisma.service';
import { TodoDeleteDto, TodoDto, TodoPatchDto } from './ dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getMe(user: User) {
    return user;
  }

  async getTodos(user: User) {
    return await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        todos: true,
      },
    });
  }

  async createTodo(user: User, todo: TodoDto) {
    await this.prisma.todo.create({
      data: {
        authorId: user.id,
        title: todo.title,
        description: todo.description,
        deadline: todo.deadline,
      },
    });
  }

  async editTodo(user: User, id: string, todo: TodoPatchDto) {
    try {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          todos: {
            update: {
              where: {
                id: Number(id),
              },
              data: todo,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PrismaError.InterpretationError) {
          throw new NotFoundException('This todo does not exist');
        }
      }
    }
  }

  async deleteTodos(user: User, ids: TodoDeleteDto) {
    const idsArray = [];
    ids.ids.forEach((id) => {
      idsArray.push({ id: id });
    });

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        todos: {
          deleteMany: idsArray,
        },
      },
    });
  }
}
