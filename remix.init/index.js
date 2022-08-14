const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const YAML = require("yaml");

const sort = require("sort-package-json");

function getRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

async function main({ rootDirectory }) {
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, ".env.example");
  const ENV_PATH = path.join(rootDirectory, ".env");
  const PACKAGE_JSON_PATH = path.join(rootDirectory, "package.json");
  const README_PATH = path.join(rootDirectory, "README.md");
  const GH_CONFIG_PATH = path.join(
    rootDirectory,
    "remix.init/.github/main.yml"
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
    fs.readFile(GH_CONFIG_PATH, "utf-8"),
  ]);

  const newEnv = env.replace(
    /^APP_SECRET=.*$/m,
    `APP_SECRET="${getRandomString(16)}"`
  );

  const newPackageJson =
    JSON.stringify(sort({ ...packageJson, name: APP_NAME }), null, 2) + "\n";

  await Promise.all([
    fs.writeFile(ENV_PATH, newEnv),
    fs.writeFile(PACKAGE_JSON_PATH, newPackageJson),
    fs.writeFile(
      README_PATH,
      readme.replace(new RegExp("RemixDetaStack", "g"), APP_NAME)
    ),
    fs.writeFile(
      README_PATH,
      readme.replace(new RegExp("RemixDetaStack", "g"), APP_NAME)
    ),
    fs.writeFile(
      path.join(rootDirectory, ".github", "workflows"),
      githubConfig
    ),
  ]);

  await askSetupQuestions({ rootDirectory, APP_NAME }).catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      throw error;
    }
  });
}

async function askSetupQuestions({ rootDirectory, appName }) {
  const answers = await inquirer.prompt([
    {
      name: "useGithubActions",
      type: "confirm",
      default: true,
      message:
        "(recommended) use Github Actions to deploy instead of Deta CLI?",
    },
  ]);

  if (answers.validate) {
    console.log(
      `Added Github Actions, be sure to set the "DETA_ACCESS_TOKEN" secret on Github`
    );

    await fs.copy(
      path.join(rootDirectory, "remix.init", ".github"),
      path.join(rootDirectory, ".github")
    );

    try {
      const DEPLOY_YAML_PATH = path.join(
        rootDirectory,
        "remix.init",
        ".github/workflows/main.yml"
      );

      const deployConfig = await fs
        .readFile(DEPLOY_YAML_PATH, "utf-8")
        .then((s) => YAML.parse(s));

      const newDeployConfig = await YAML.stringify(
        (deployConfig.jobs.Deploy.env["deta-name"] = appName)
      );

      await fs.writeFile(DEPLOY_YAML_PATH, newDeployConfig);
    } catch (error) {
      console.error(error);
    }
  }
  console.log(
    `✅  Project is ready! Start development with "deta new && npm run deploy"`
  );
}

module.exports = main;
