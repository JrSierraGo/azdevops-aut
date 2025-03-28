export enum MAIN_OPTIONS {
    PULL_REQUEST = 'Crear Pull Request',
    VARIABLES = 'Crear o editar variables',
    PR_APPROVAL = 'Aprobar y completar Pull Request',
    CHANGE_FILE ='Actualizar Dockerfile',
    EXIT = 'Salir'
};

export const WAYS: Record<string, string> = {
    AUTOMATIC: 'Automatico con los datos del archivo data.json',
    MANUAL: 'Asistido, seleccionando los datos'
  };