import { createModule, getAllModules } from "../src/modules.mjs"

export const createModuleREST = {
    method: 'POST',
    path: '/projects/:project/modules',
    onRequest: (request, response) => {
        const {project}=request.params;
        const { module } = request.body;
        createModule(project, module)
            .then(value => {
                response.json(value);
            })
            .catch(reason => {
                response.status(400).send(reason);
            });
    }
}

export const getAllModulesREST = {
    method: 'GET',
    path: '/projects/:project/modules',
    onRequest: (request, response) => {
        const {project}=request.params;
        getAllModules(project)
            .then(value => {
                response.json(value);
            })
            .catch(reason => {
                response.status(400).send(reason);
            });
    }
}
