// routes/branch.routes.js

import { Router } from 'express'
import { BranchController } from './branchs.controller.js'
import { checkAuthMiddleware } from '../../../middleware/checkAuthMiddleware.js'
import { Role } from '../../../utils/role.js'


const router = Router()

router.post('/create', checkAuthMiddleware(Role.BUSINESS_OWNER), BranchController.create)
router.get('/', checkAuthMiddleware(Role.BUSINESS_OWNER), BranchController.findAll)
router.get('/:id', checkAuthMiddleware(Role.BUSINESS_OWNER), BranchController.findOne)
router.put('/:id', checkAuthMiddleware(Role.BUSINESS_OWNER), BranchController.update)
router.delete('/:id', checkAuthMiddleware(Role.BUSINESS_OWNER), BranchController.delete)

export const BranchRoute = router
