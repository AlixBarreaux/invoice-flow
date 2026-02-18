import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { Express } from "express";
import path from "path";

export function setupSwagger(app: Express) {
  if (process.env.NODE_ENV !== "development") return;

  const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yml"));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
