
import { Router }               from    'express';
import { authMiddleware }       from    '../../middlewares/auth.middleware';
import { asyncCatcher }         from    '../../middlewares/async_catcher.middleware';
import { autoFormatter }        from    '../../middlewares/auto_formatter.middleware';
import { errorHandler }         from    '../../middlewares/error_handler.middleware';
import { validate }             from    '../../middlewares/validate.middleware';
import { spacyGameToolController }       from    './spacyGameTool.controller';
import { AddPosPlaneteSchema }   from    './spacyGameTool.schema'


export const spacyGameToolRouter = Router();

spacyGameToolRouter.get('/galaxie', validate(AddPosPlaneteSchema), asyncCatcher(spacyGameToolController.check));
spacyGameToolRouter.post('/galaxie', validate(AddPosPlaneteSchema), asyncCatcher(spacyGameToolController.check));


// spacyGameToolRouter.get('/user', validate(AddPosPlaneteSchema), asyncCatcher(spacyGameToolController.check));