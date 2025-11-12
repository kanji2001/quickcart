"use strict";

const { app } = require("../backend/dist/app");
const { connectDatabase } = require("../backend/dist/database/mongoose");
const { ensureInitialAdmin } = require("../backend/dist/bootstrap/ensure-admin");
const { ensureIndexes } = require("../backend/dist/bootstrap/ensure-indexes");
const mongoose = require("mongoose");

let isInitialized = false;

const isConnected = () => mongoose.connection.readyState === 1;

async function initialize() {
  if (isInitialized && isConnected()) {
    return;
  }

  if (!isConnected()) {
    await connectDatabase();
  }

  await ensureIndexes();
  await ensureInitialAdmin();

  isInitialized = true;
}

async function handler(req, res) {
  await initialize();
  return app(req, res);
}

handler.config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};

module.exports = handler;


