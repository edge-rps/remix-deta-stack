const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const YAML = require("YAML");

const sort = require("sort-package-json");

function getRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

async function main({ rootDirectory }) {
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, ".env.example");
  const ENV_PATH = path.join(rootDirectory, ".env");
  const PACKAGE_JSON_PATH = path.join(rootDirectory, "package.json");
  const README_PATH = path.join(rootDirectory, "README.md");
  const GITHUB_CONFIG_PATH = path.join(
    rootDirectory,
    ".github",
    "workflows",
    "main.yml"
  );

  const DIR_NAME = path.basename(rootDirectory);
  const SUFFIX = getRandomString(2);

  const APP_NAME = (DIR_NAME + "-" + SUFFIX)
    // get rid of anything that's not allowed in an app name
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  const [env, packageJson, readme, githubConfig] = await Promise.all([
    fs.readFile(EXAMPLE_ENV_PATH, "utf-8"),
    fs.readFile(PACKAGE_JSON_PATH, "utf-8").then((s) => JSON.parse(s)),
    fs.readFile(README_PATH, "utf-8"),
    fs.readFile(GITHUB_CONFIG_PATH, "utf-8").then((s) => YAML.parse(s)),
  ]);

  const newEnv = env.replace(
    /^APP_SECRET=.*$/m,
    `APP_SECRET="${getRandomString(16)}"`
  );

  const newPackageJson =
    JSON.stringify(sort({ ...packageJson, name: APP_NAME }), null, 2) + "\n";

  githubConfig.jobs.Deploy.env["deta-name"] = APP_NAME;

  await Promise.all([
    fs.writeFile(ENV_PATH, newEnv),
    fs.writeFile(PACKAGE_JSON_PATH, newPackageJson),
    fs.writeFile(
      README_PATH,
      readme.replace(new RegExp("RemixDetaStack", "g"), APP_NAME)
    ),
    fs.writeFile(GITHUB_CONFIG_PATH, YAML.stringify(githubConfig)),
  ]);
}

module.exports = main;
