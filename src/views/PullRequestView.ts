import inquirer from 'inquirer';


export async function showManualPullRequestMenu(repoList:string[]): Promise<string[]> {
  const { repositories } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'repositories',
      message: 'Seleccione los repositorios para crear el PR',
      choices: repoList
    }
  ]);
  return repositories;
}

