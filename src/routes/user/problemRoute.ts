import express from 'express'
import ProblemController from '../../controllers/problem-controller/ProblemController'
import { authenticate} from "../../middleware/authMiddleware";

const problem_route = express.Router()

const problemController = new ProblemController()

problem_route.get('/problems',problemController.getProblems)
problem_route.post('/test-problem',authenticate, problemController.testProblem);

export default problem_route