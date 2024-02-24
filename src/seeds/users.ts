import { faker } from '@faker-js/faker';
import axios from 'axios';

const seedUsers = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const email = faker.internet.email();
      const user = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: email.toLowerCase(),
        password: 'password'
      };
      await axios.post('http://localhost:5500/api/v1/signup', user);
    } catch (error) {
      console.log(error);
      process.exit();
    }
  }
};
seedUsers();
