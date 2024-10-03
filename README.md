# azdevops-automation

## Motivación
Este proyecto nace para "automatizar" tareas repetitivas que se hacian de forma manual en el proceso de desarrollo usando Azure Devops

## Estructura
Está desarrollado en **Node.js** con **TypeScript** utilizando el cliente **[azure-devops-node-api](https://github.com/microsoft/azure-devops-node-api)** y **Dotenv** para manejar las variables de entorno

```
.
├── src
│   ├── AZDevopsApiService.ts
│   ├── PRService.ts
│   └── VariableGroupsService.ts
├── .env
├── data.json
├── environment.ts
├── package.json
├── README.md
└── tsconfig.json
```

Todas las variables son leidas del archivo `.env` y exportadas desde `environment.ts` con valores por defecto para evitar undefined

## ¿Que puedo hacer con el proyecto?
- Crear PullRequest desde un source a un target agregando el ultimo WorkItem de la rama source.
- Crear o Modificar variables de entorno de los **Variable Groups** de *Azure Pipelines*
- ...Todo lo que el api de azure devops pueda ofrecer

## ¿Como lo uso?
- Instale las dependencias
```
    npm install
```
- Crea un `.env` en la raiz del proyecto basandose en el `.env.example` que está incluido.
- El `index.ts` lee la variable `SERVICE` para saber que servicio ejecutar, configura la variable en el archivo `.env` de acuerdo a lo que necesites. Actualmente existen las opciones:
    ```
    SERVICE="VARIABLES"
    SERVICE="PR"
    ```
- modifica el archivo `data.json` de acuerdo a lo que necesites realizar. este Json contiene las propiedades:
    - **repositories**: Define los repositorios de código para los cuales quieres realizar los PR (el nombre definido en Azure Repos) y a su vez definen el nombre de los grupos de variables que quieres modificar (cuando se usa variables)
    - **variables**: Define un objeto key, value de como deben quedar creadas las variables.
    *importante*: se creará cada una de las variables definidas en esta propiedad por cada uno de los repositories (grupo de variables) que se defininan en **repositories**.   
- Ejecute el proyecto
    ```
    npm start
    ```
Cada servicio tiene un output en consola confirmando lo realizado o la falla.
