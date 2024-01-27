import { flag, flags, isBooleanAt, isStringAt, makeHelmMessage, rule, type Rule } from "@jondotsoy/flags";
import { createWorkspace } from "../create_workspace";
import { ulid } from "ulid";
import { globalConfig } from "../common/load_local_config";

export const create = async (args: string[]) => {
  type Options = {
    removeWorkspaceAfter: boolean;
    showHelp: boolean
    name: string
  };

  const rules: Rule<Options>[] = [
    rule(flag("--rm"), isBooleanAt("removeWorkspaceAfter"), {
      description: "remove the workspace before of use",
    }),
    rule(flag('--name', '-n'), isStringAt('name'), { description: 'name for the demo' }),
    rule(flag('--help', '-h'), isBooleanAt('showHelp'), { description: 'show this message' }),
  ];

  const { removeWorkspaceAfter, showHelp, name } = flags<Options>(args, {}, rules);

  if (showHelp) return console.log(makeHelmMessage('demo create', rules, ['', '--rm']))

  const relativePath = `${name ?? ulid()}/`

  const location = new URL(relativePath, globalConfig.demosLocation);

  await createWorkspace({
    location,
    removeWorkspaceAfter: removeWorkspaceAfter,
  });
};
