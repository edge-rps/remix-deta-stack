# Remix Deta Stack

What you will need
- [Remix](https://remix.run)
- [Deta CLI](https://docs.deta.sh/docs/cli/install)

---


How to install:
```sh
npx create-remix --template ryker2000/remix-deta-stack # create a new app
deta new --name my-remix-app # make sure that this name matches what you want for your remix app
npm run deploy # ⚠ consider setting up github actions as a better alternative.
```

🐛 Bug fix:
for those who are getting a "null" page error that is because you forgot to run `npm run build` before running `deta deploy`. Setting up GH actions will automate this.


---

# Github Actions

>I don't recommend  using "npm run deploy" to deploy your app but rather using [Github Actions](https://github.com/features/actions). The reason for this is that Deta deploys your local files when using the npm command this may cause conflicting file issues. 

> Github Actions allows you to use their servers to build the files > upload to Deta. The bonus is that it auto deploys to Deta on Git Push!

To setup Github Actions:
1. to your github repo settings > secrets > actions > set new secret `DETA_ACCESS_TOKEN` to equal your deta project key
2. `.github/workflows/main.yml` file to make sure that the "deta-name" and "deta-project" property match the one on Deta.sh


---
[MIT Open Source](LICENSE)
