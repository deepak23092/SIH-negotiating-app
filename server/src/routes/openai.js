const express = require("express");
const { generateResponse } = require("../controllers/openAIController");

const router = express.Router();

router.post("/generate-action", generateResponse);

module.exports = router;
