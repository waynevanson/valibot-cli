export class ExpectedError extends Error {
  constructor(...args: Parameters<typeof Error>) {
    args[0] += "\n\n";
    args[0] += [
      `CONGRATULATIONS, YOU ARE EXPERIENCING A BUG!`,
      ``,
      `We have thoroughly tested this ourselves and expect all consumers to never see this error.`,
      ``,
      `This has originated from \`@waynevanson/valibot-cli\`, but has likely been used to create another application (the one you've just ran).`,
      `Please submit an issue at https://github.com/waynevanson/valibot-cli so we can ensure it does not happen again.`,
      ``,
    ].join("\n");
    super(...args);
  }
}
