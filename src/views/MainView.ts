import inquirer from 'inquirer';
import { MAIN_OPTIONS } from '../models/ConstantsOptions';

export async function showMainMenu(): Promise<string> {
  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: '¿Qué acción desea realizar?',
      choices: Object.values(MAIN_OPTIONS)
    }
  ]);

  return option ?? "";
}