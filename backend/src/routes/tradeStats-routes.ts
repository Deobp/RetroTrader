import { Router } from "express";
import { authenticateToken } from "../middleware/auth-middleware";
import {
  getTradeStats,
  resetTradeStats,
  addTrade,
  takePosition,
  closePosition
} from "../controllers/tradeStats-controller";

const router: Router = Router();

router.use(authenticateToken);

router.get("/stats", getTradeStats as any);
router.post("/stats/reset", resetTradeStats as any);
router.post("/stats/trade", addTrade as any);
router.post("/stats/position/take", takePosition as any);
router.post("/stats/position/close", closePosition as any);

export default router;
