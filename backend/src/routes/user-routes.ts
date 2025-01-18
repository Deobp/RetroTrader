import express from "express";
import { authenticateToken } from "../middleware/auth-middleware";
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  updateUser, 
  deleteUser 
} from "../controllers/user-controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// protected
router.get("/me", authenticateToken, getCurrentUser);

router.put("/update", authenticateToken, updateUser);
router.delete("/delete", authenticateToken, deleteUser);

export default router;

