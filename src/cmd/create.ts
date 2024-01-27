import { flag, flags, isBooleanAt, makeHelmMessage, rule, type Rule } from "@jondotsoy/flags";
import { createWorkspace } from "../create_workspace";
import { ulid } from "ulid";
import { demosLocation } from "../config";

export const create = async (args: string[]) => {
  type Options = {
    removeWorkspaceAfter: boolean;
    showHelp: boolean
  };

  const rules: Rule<Options>[] = [
    rule(flag("--rm"), isBooleanAt("removeWorkspaceAfter"), {
      description: "remove the workspace before of use",
    }),
    rule(flag('--help', '-h'), isBooleanAt('showHelp'), { description: 'show this message' }),
  ];

  const { removeWorkspaceAfter, showHelp } = flags<Options>(args, {}, rules);

  if (showHelp) return console.log(makeHelmMessage('demo create', rules, ['', '--rm']))

  const location = new URL(`${ulid()}/`, demosLocation);

  await createWorkspace({
    location,
    removeWorkspaceAfter: removeWorkspaceAfter,
  });
};
