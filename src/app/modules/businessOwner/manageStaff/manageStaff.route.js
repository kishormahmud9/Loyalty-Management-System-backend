// routes/staff.routes.js

import { Router } from 'express'
import { StaffController } from './manageStaff.controller.js'
import { authenticate, authorize, businessScope } from "../../../middleware/auth.middleware.js";
import { enforceSubscription } from "../../../middleware/enforceSubscription.js";
import { PERMISSIONS } from "../../../config/permissions.js";


const router = Router()

router.post('/create', authenticate, authorize(PERMISSIONS.STAFF.CREATE), businessScope, enforceSubscription, StaffController.create)
router.get('/all/:branchId', authenticate, authorize(PERMISSIONS.STAFF.READ), businessScope, enforceSubscription, StaffController.findAll)
router.get('/all', authenticate, authorize(PERMISSIONS.STAFF.READ), businessScope, enforceSubscription, StaffController.getAllStaff)
router.get('/:id', authenticate, authorize(PERMISSIONS.STAFF.READ), businessScope, enforceSubscription, StaffController.findOne)
router.put('/:id', authenticate, authorize(PERMISSIONS.STAFF.UPDATE), businessScope, enforceSubscription, StaffController.update)

// soft delete (recommended)
router.patch('/:id/deactivate', authenticate, authorize(PERMISSIONS.STAFF.DELETE), businessScope, enforceSubscription, StaffController.deactivate)

// hard delete (optional)
router.delete('/:id', authenticate, authorize(PERMISSIONS.STAFF.DELETE), businessScope, enforceSubscription, StaffController.delete)

export const ManageStaffRoute = router
