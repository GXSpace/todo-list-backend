import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:Wz278HfMYGMDwlmAeiiF@localhost:5434/todo?schema=public',
        },
      },
    });
  }
}
