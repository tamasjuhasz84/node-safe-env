import { validateString } from "./string";
import { validateNumber } from "./number";
import { validateBoolean } from "./boolean";
import { validateEnum } from "./enum";
import { validateUrl } from "./url";
import { validatePort } from "./port";
import { validateJson } from "./json";
import type { EnvValidator } from "./types";

export const validatorRegistry = {
  string: validateString,
  number: validateNumber,
  boolean: validateBoolean,
  enum: validateEnum,
  url: validateUrl,
  port: validatePort,
  json: validateJson,
} as const satisfies Record<string, EnvValidator>;
