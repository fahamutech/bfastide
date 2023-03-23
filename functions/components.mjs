import { createComponent, readAComponent } from "../src/components.mjs";
import { readModuleComponents } from "../src/modules.mjs";

export const getAllModuleComponentsREST = {
    method: 'GET',
    path: '/projects/:project/modules/:module/components',
    onRequest: (request, response) => {
        const { module,project } = request.params;
        readModuleComponents(project, module)
            .then(value => {
                response.json(value);
            })
            .catch(reason => {
                response.status(400).send(reason);
            });
    }
}

export const createAComponentREST = {
    method: 'POST',
    path: '/projects/:project/modules/:module/components',
    onRequest: (request, response) => {
        const { module,project } = request.params;
        const {name,description}=request.body;
        createComponent({project, module,name,description})
            .then(value => {
                response.json(value);
            })
            .catch(reason => {
                response.status(400).send(reason);
            });
    }
}

export const getAComponentREST = {
    method: 'GET',
    path: '/projects/:project/modules/:module/components/:name',
    onRequest: (request, response) => {
        const { module,name,project } = request.params;
        readAComponent({project, module,name})
            .then(value => {
                response.json(value);
            })
            .catch(reason => {
                response.status(400).send(reason);
            });
    }
}