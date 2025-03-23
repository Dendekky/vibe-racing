import { server } from '../index';

beforeAll(() => {
  // Any setup needed before tests run
});

afterAll((done) => {
  server.close(() => {
    done();
  });
}); 