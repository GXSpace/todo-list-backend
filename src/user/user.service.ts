import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getMe(user: User) {
    return user;
  }

  getTodos(user: User) {
    return this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        todos: true,
      },
    });
  }
}
