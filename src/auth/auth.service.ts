import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, NewUserDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'prisma-error-enum';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signIn(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('This account does not exists');

    const pswMatch = await argon.verify(user.password, dto.password);

    if (!pswMatch) throw new ForbiddenException('Wrong password');

    delete user.password;
    return user;
  }

  async signUp(dto: NewUserDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hash,
        },
      });

      delete user.password;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PrismaError.UniqueConstraintViolation) {
          throw new ForbiddenException(
            "There's already an account with this " + error.meta.target[0],
          );
        }
      }
    }
  }
}
