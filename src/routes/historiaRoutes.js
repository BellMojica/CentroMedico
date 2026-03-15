const express = require('express');
const router = express.Router();
const historiaController = require('../controllers/historiaController');

router.get('/', historiaController.getAll);
router.get('/:id', historiaController.getById);
router.post('/', historiaController.create);
router.put('/:id', historiaController.update);
router.delete('/:id', historiaController.remove);
router.post('/:id/asignar-paciente', historiaController.assignToPatient);

module.exports = router;
