import SupportService from "./support.service.js";

class SupportController {
  static async create(req, res) {
    try {
      const support = await SupportService.createSupport({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(support);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const supports = await SupportService.getAllSupport();
      res.json(supports);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getOne(req, res) {
    try {
      const support = await SupportService.getSupportById(req.params.id);

      if (!support) {
        return res.status(404).json({ message: "Support ticket not found" });
      }

      res.json(support);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default SupportController;
