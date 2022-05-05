#Before deploy

Please edit PROJECT_NAME, MYSQL_SERVER_ADMIN_USERNAME and STORAGE_ACCOUNT_NAME with global unique name.

Please edit MYSQL_SERVER_ADMIN_PASSWORD, SERVICE_PRINCIPAL_PASSWORD with a safe password.

Please edit Mail SMTP Server, Username and Password / App password,

Please make sure your system have installed azure-cli (install with [Microsoft guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) recommended), cdktf (v0.5.0 required), docker, jq and mysql client (v5.7 recommended).
Please login to az cli and choose the subscription you want to deploy this project.
Please create an AAD by yourself ( since Azure requires us to prove we are not bot),
then create Face, Text Analytics and Computer Vision to review and acknowledge the terms.
(ref: https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-apis-create-account-cli?tabs=windows#prerequisites )

#How to deploy?

run belows commands:

    cdktf get
    npm i
    tsc
    ./deploy.sh
#How to import test/demo data to mysql?

run belows commands:

    ./insert_data_to_db.sh
#How to destroy?

run this commands:

    ./destroy.sh

#explaination

In this project, we will use github branch name and its hash to name the Docker image,
so due the Docker policy, your github repository and its branch name must be in lowercase letters.



If you fail to deploy due to docker get permission denied, please run below commands and reboot your system:

    sudo groupadd docker
    sudo usermod -aG docker $(your_username)
    newgrp docker


#  Your cdktf typescript project is ready!

cat README.md                Print this message

Compile:

    npm run get :          Import/update Terraform providers and modules (you should check-in this directory)
    npm run compile       Compile typescript code to javascript (or "npm run watch")
    npm run watch         Watch for changes and compile typescript in the background
    npm run build         Compile typescript

Synthesize:

    cdktf synth [stack]   Synthesize Terraform resources from stacks to cdktf.out/ (ready for 'terraform apply')

Diff:

    cdktf diff [stack]    Perform a diff (terraform plan) for the given stack

Deploy:

    cdktf deploy [stack]  Deploy the given stack

Destroy:

    cdktf destroy [stack] Destroy the stack


Upgrades:

    npm run upgrade        Upgrade cdktf modules to latest version
    npm run upgrade:next   Upgrade cdktf modules to latest "@next" version (last commit)

#Use Prebuilt Providers:

You can add one or multiple of the prebuilt providers listed below:

    npm install @cdktf/provider-aws
    npm install @cdktf/provider-google
    npm install @cdktf/provider-azurerm
    npm install @cdktf/provider-docker
    npm install @cdktf/provider-github
    npm install @cdktf/provider-null

You can also build any module or provider locally. Learn more https://cdk.tf/modules-and-providers
