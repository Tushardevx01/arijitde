import * as fs from 'fs';
import * as path from 'path';

const openApiDocument: any = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf-8')
);

export function registerPath(pathStr: string, pathItem: any): void {
  (openApiDocument.paths ??= {})[pathStr] = pathItem;
}

export function registerSchema(name: string, schema: any): void {
  if (!openApiDocument.components) openApiDocument.components = { schemas: {} };
  if (!openApiDocument.components.schemas) openApiDocument.components.schemas = {};
  openApiDocument.components.schemas[name] = schema;
}

export { openApiDocument };