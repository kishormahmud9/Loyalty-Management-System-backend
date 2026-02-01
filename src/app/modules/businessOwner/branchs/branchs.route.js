// routes/branch.routes.js

import { Router } from 'express'
import { BranchController } from './branchs.controller.js'
import { authenticate, authorize, businessScope } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";

import { upload } from "../../../utils/fileUpload.js";


const router = Router()

router.post('/create', authenticate, authorize(PERMISSIONS.BRANCH.CREATE), businessScope, upload.single("branchImage"), BranchController.create)
router.get('/all', authenticate, authorize(PERMISSIONS.BRANCH.READ), businessScope, BranchController.findAll)
router.get('/my-branches', authenticate, authorize(PERMISSIONS.BRANCH.READ), businessScope, BranchController.getMyBranches)
router.get('/:id', authenticate, authorize(PERMISSIONS.BRANCH.READ), businessScope, BranchController.findOne)
router.put('/:id', authenticate, authorize(PERMISSIONS.BRANCH.UPDATE), businessScope, upload.single("branchImage"), BranchController.update)
router.delete('/:id', authenticate, authorize(PERMISSIONS.BRANCH.DELETE), businessScope, BranchController.delete)

export const BranchRoute = router
