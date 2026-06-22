import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import vendorsRouter from "./vendors";
import ordersRouter from "./orders";
import recommendationsRouter from "./recommendations";
import dashboardRouter from "./dashboard";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(vendorsRouter);
router.use(ordersRouter);
router.use(recommendationsRouter);
router.use(dashboardRouter);
router.use(seedRouter);

export default router;
