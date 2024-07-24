import { join } from 'path';

export const templatesPath = {
  confirmation: join(__dirname, 'confirmationTemplate.html'),
  passwordReset: join(__dirname, 'passReset.html'),
};
