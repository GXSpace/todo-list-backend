import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto, NewUserDto } from '../src/auth/dto';
import { TodoDto, TodoPatchDto } from 'src/user/ dto';
import { inspect } from 'util';

describe('Todo App Backend e2e tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  describe('Auth', () => {
    const incompleteDto: any = {
      email: 'test@gmail.com',
    };

    describe('Sign Up', () => {
      const defaultDto: NewUserDto = {
        email: 'test@gmail.com',
        username: 'test',
        password: '12345',
      };

      it('Should throw when missing some fields', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(incompleteDto)
          .expectStatus(400);
      });

      it('Should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(defaultDto)
          .expectStatus(201);
      });

      it('Should throw on duplicated account sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(defaultDto)
          .expectStatus(403);
      });
    });

    describe('Sign In', () => {
      const notexistsDto: AuthDto = {
        email: 'notexists@gmail.com',
        password: '12345',
      };

      const incorrectDto: AuthDto = {
        email: 'test@gmail.com',
        password: 'incorrect',
      };

      const correctDto: AuthDto = {
        email: 'test@gmail.com',
        password: '12345',
      };

      it('Should throw when missing some fields', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(incompleteDto)
          .expectStatus(400);
      });

      it('Should throw when account not found', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(notexistsDto)
          .expectStatus(403);
      });

      it('Should throw when incorrect password', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(incorrectDto)
          .expectStatus(403);
      });

      it('Should sign in successfully', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(correctDto)
          .expectStatus(200)
          .stores('userToken', 'access_token');
      });
    });

    describe('Auth Guards', () => {
      it('GET /user/me', () => {
        return pactum.spec().get('/user/me').expectStatus(401);
      });
      it('GET /user/todos', () => {
        return pactum.spec().get('/user/todos').expectStatus(401);
      });
      it('POST /user/todos', () => {
        return pactum.spec().post('/user/todos').expectStatus(401);
      });
      it('PATCH /user/todos/1', () => {
        return pactum.spec().patch('/user/todos/1').expectStatus(401);
      });
      it('DELETE /user/todos', () => {
        return pactum.spec().delete('/user/todos').expectStatus(401);
      });
    });
  });

  describe('User', () => {
    describe('Get Profile', () => {
      it('Should get the user profile', () => {
        return pactum.spec().get('/user/me').withHeaders({
          Authorization: 'Bearer $S{userToken}',
        });
      });
    });

    describe('Todos', () => {
      const now = new Date(Date.now());
      const todoDto: any = {
        title: 'Task #1',
        description: 'Do things',
        deadline: now.toISOString(),
      };

      describe('Create Todo', () => {
        it('Should throw when missing some fields', () => {
          return pactum
            .spec()
            .post('/user/todos')
            .withBody({})
            .withHeaders({
              Authorization: 'Bearer $S{userToken}',
            })
            .expectStatus(400);
        });

        it('Should create a todo', () => {
          return pactum
            .spec()
            .post('/user/todos')
            .withBody(todoDto)
            .withHeaders({
              Authorization: 'Bearer $S{userToken}',
            })
            .expectStatus(201)
            .stores('todoId', 'id');
        });
      });

      describe('Read Todos', () => {
        it('Should read the user todos', () => {
          return pactum
            .spec()
            .get('/user/todos')
            .withHeaders({
              Authorization: 'Bearer $S{userToken}',
            })
            .expectStatus(200)
            .expectBodyContains(todoDto.title)
            .expectBodyContains(todoDto.description)
            .expectBodyContains(todoDto.deadline);
        });
      });

      describe('Update Todo', () => {
        const patchDto: TodoPatchDto = {
          title: 'Updated title',
        };

        it('Should update todo', () => {
          return pactum
            .spec()
            .patch('/user/todos/{id}')
            .withPathParams('id', '$S{todoId}')
            .withHeaders({
              Authorization: 'Bearer $S{userToken}',
            })
            .withBody(patchDto)
            .expectStatus(200);
        });

        it('Should read the todo updated title', () => {
          return pactum
            .spec()
            .get('/user/todos')
            .withHeaders({
              Authorization: 'Bearer $S{userToken}',
            })
            .expectStatus(200)
            .expectBodyContains(patchDto.title);
        });
      });

      describe('Delete Todo', () => {
        it('Should delete the todo', () => {
          return pactum
            .spec()
            .delete('/user/todos')
            .withHeaders({
              Authorization: 'Bearer $S{userToken}',
            })
            .withBody({ ids: ['$S{todoId}'] })
            .expectStatus(200);
        });
      });
    });
  });

  afterAll(() => {
    app.close();
  });
});
