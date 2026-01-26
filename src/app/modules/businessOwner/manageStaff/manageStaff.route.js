// routes/staff.routes.js

import { Router } from 'express'
import { StaffController } from './manageStaff.controller.js'
import { authenticate, authorize, businessScope } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";


const router = Router()

router.post('/create', authenticate, authorize(PERMISSIONS.STAFF.CREATE), businessScope, StaffController.create)
router.get('/', authenticate, authorize(PERMISSIONS.STAFF.READ), businessScope, StaffController.findAll)
router.get('/:id', authenticate, authorize(PERMISSIONS.STAFF.READ), businessScope, StaffController.findOne)
router.put('/:id', authenticate, authorize(PERMISSIONS.STAFF.UPDATE), businessScope, StaffController.update)

// soft delete (recommended)
router.patch('/:id/deactivate', authenticate, authorize(PERMISSIONS.STAFF.DELETE), businessScope, StaffController.deactivate)

// hard delete (optional)
router.delete('/:id', authenticate, authorize(PERMISSIONS.STAFF.DELETE), businessScope, StaffController.delete)

export const ManageStaffRoute = router
