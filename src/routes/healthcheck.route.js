import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller.js"

const HealthCheckRoute = Router();

HealthCheckRoute.route('/').get(healthcheck);

export default HealthCheckRoute