import express from 'express'
import ProblemController from '../../controllers/problem-controller/ProblemController'

const problem_route = express.Router()

const problemController = new ProblemController()

problem_route.get('/problems',problemController.getProblems)

export default problem_route