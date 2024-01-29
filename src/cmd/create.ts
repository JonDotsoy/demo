import {
  flag,
  flags,
  isBooleanAt,
  isStringAt,
  makeHelmMessage,
  rule,
  type Rule,
} from "@jondotsoy/flags";
import { createWorkspace } from "../create_workspace";
import { ulid } from "ulid";
import { globalConfig } from "../common/load_local_config";

export const create = async (args: string[]) => {
  type Options = {
    removeWorkspaceAfter: boolean;
    showHelp: boolean;
    name: string;
    template: string;
    noOpen: boolean;
  };

  const rules: Rule<Options>[] = [
    rule(flag("--rm"), isBooleanAt("removeWorkspaceAfter"), {
      description: "remove the workspace before of use",
    }),
    rule(flag("--name", "-n"), isStringAt("name"), {
      description: "name for the demo",
    }),
    rule(flag("--template", "-t"), isStringAt("template"), {
      description: "describe templete to make workspace",
    }),
    rule(flag("--help", "-h"), isBooleanAt("showHelp"), {
      description: "show this message",
    }),
    rule(flag("--no-open"), isBooleanAt("noOpen"), {
      description: "omit open editor",
    }),
  ];

  const { removeWorkspaceAfter, showHelp, name, noOpen } = flags<Options>(
    args,
    {},
    rules,
  );

  if (showHelp)
    return console.log(makeHelmMessage("demo create", rules, ["", "--rm"]));

  const relativePath = `${name ?? ulid()}/`;

  const location = new URL(relativePath, globalConfig.demosLocation);

  let openEditor = true;

  if (noOpen) openEditor = false;

  await createWorkspace({
    location,
    removeWorkspaceAfter: removeWorkspaceAfter,
    openEditor,
  });
};
