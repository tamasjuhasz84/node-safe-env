import { validateString } from "./string";
import { validateNumber } from "./number";
import { validateBoolean } from "./boolean";
import { validateEnum } from "./enum";
import { validateUrl } from "./url";
import { validatePort } from "./port";
import { validateJson } from "./json";
import type { EnvValidator } from "./types";

export const validators = {
  string: validateString,
  number: validateNumber,
  boolean: validateBoolean,
  enum: validateEnum,
  url: validateUrl,
  port: validatePort,
  json: validateJson,
} satisfies Record<string, EnvValidator>;

export type { ParseResult, EnvValidator } from "./types";
