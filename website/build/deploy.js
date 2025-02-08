const cp = require("child_process");
const deploy = require("gh-pages");

const execute = (str) =>
  cp.execSync(str, {
    stdio: "inherit",
    cwd: `${__dirname}/../..`,
  });

execute("npm run build");
execute("npm run typedoc");
execute("npm run typedoc -- --json website/public/api/openapi.json");

deploy.publish(
  `${__dirname}/../public`,
  {
    branch: "gh-pages",
    dotfiles: true,
  },
  (err) => {
    if (err) {
      console.log(err);
      process.exit(-1);
    } else clear();
  },
);
