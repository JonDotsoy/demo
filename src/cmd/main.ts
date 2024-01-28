import {
  command,
  flags,
  restArgumentsAt,
  type Rule,
  makeHelmMessage,
  rule,
  flag,
  isBooleanAt,
} from "@jondotsoy/flags";
import { create as createCmd } from "./create";

export const main = async (args: string[]) => {
  type Options = {
    create: string[];
  };

  const rules: Rule<Options>[] = [
    rule(command("create"), restArgumentsAt("create"), {
      description: "create a new workspace",
    }),
  ];

  const { create } = flags<Options>(args, {}, rules);

  if (create) return createCmd(create);

  console.log(makeHelmMessage("demo", rules));
};
