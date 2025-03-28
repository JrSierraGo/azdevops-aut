import inquirer from 'inquirer';
import { WAYS } from '../models/ConstantsOptions';


export async function showInputData(message:string): Promise<string> {
    const { data } = await inquirer.prompt([
      {
        type: 'input',
        name: 'data',
        message: message,
      }
    ]);
  
  return data;
}

export async function showWaysMenu(message:string): Promise<string> {
    const { way } = await inquirer.prompt([
      {
        type: 'list',
        name: 'way',
        message: message,
        choices: Object.values(WAYS)
      }
    ]);
    
    return way;
  }