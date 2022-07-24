import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto, NewUserDto } from '../src/auth/dto';

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
          .expectStatus(200);
      });
    });
  });

  describe('User', () => {
    describe('Get Profile', () => {});

    describe('Todos', () => {
      describe('Create Todo', () => {});
      describe('Read Todos', () => {});
      describe('Update Todo', () => {});
      describe('Delete Todo', () => {});
    });
  });

  afterAll(() => {
    app.close();
  });
});
