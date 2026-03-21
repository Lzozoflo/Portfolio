import { type Request, type Response, type NextFunction } from 'express';
import * as js2xml from "js2xmlparser";

export const autoFormatter = (req: Request, res: Response, next: NextFunction) => {
    const data = res.locals.data;
    if (!data) return next(); // Si rien n'est stocké, on passe à la suite

    res.format({
        'application/json': () => {console.log("wouhou on laisse json");res.json(data)},
        'application/xml': () => res.type('xml').send(js2xml.parse("user", data)),
        'default': () => res.status(406).send('Not Acceptable')
    });
};
