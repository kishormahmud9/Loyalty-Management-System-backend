// routes/staff.routes.js

import { Router } from 'express'
import { StaffController } from './manageStaff.controller.js'


const router = Router()

router.post('/create', StaffController.create)
router.get('/', StaffController.findAll)
router.get('/:id', StaffController.findOne)
router.put('/:id', StaffController.update)

// soft delete (recommended)
router.patch('/:id/deactivate', StaffController.deactivate)

// hard delete (optional)
router.delete('/:id', StaffController.delete)

export const ManageStaffRoute = router
