import {Construct} from "constructs";
import {App, TerraformOutput, TerraformStack} from "cdktf";
import {AzurermProvider, ResourceGroup} from "@cdktf/provider-azurerm";
import {BlobStorageConstruct} from "./lib/blob";
import {MySQLServerConstruct} from "./lib/mysql_server";
import {MySQLDatabaseConstruct} from "./lib/mysql_db";
import {MySQLFirewallConstruct} from "./lib/mysql_db_firewall";
import {ApplicationInsightsConstruct} from "./lib/application_insight";
import {ContainerRegistrySConstruct} from "./lib/container_registry";
import {AppServicePlanConstruct} from "./lib/app_service_plan";
import {AppServiceConstruct} from "./lib/app_service";
import {resolve} from "path";
import {config,parse} from "dotenv";
import {KeyVaultConstruct} from "./lib/key_vault";
import {AzureAdConstruct} from "./lib/azure_ad";
import * as fs from "fs";


interface MainStackProps {
    env: string;
}

export class MainStack extends TerraformStack {
    constructor(scope: Construct, name: string, props: MainStackProps) {
        super(scope, name);

        config({path: resolve(__dirname, `./${props.env}.env`)});
        process.env.ENV = props.env;
        process.env.RESOURCE_GROUP_NAME = process.env.RESOURCE_GROUP_NAME + props.env;
        console.log("Resource Group:" + process.env.RESOURCE_GROUP_NAME);

        if (fs.existsSync(resolve(__dirname, `./secrets.env`))) {
            console.log("Overrides with secrets.env");
            const envConfig = parse(fs.readFileSync(resolve(__dirname, `./secrets.env`)))
            for (const k in envConfig) {
                process.env[k] = envConfig[k]
            }
        }

        new AzurermProvider(this, "Azure provider", {
            features: [{}],
            skipProviderRegistration: true,
        });

        const resourceGroup = new ResourceGroup(this, "Resource group", {
            name: process.env.RESOURCE_GROUP_NAME!,
            location: process.env.LOCATION!,
        });

        const azureAdConstruct = new AzureAdConstruct(this,"Azure AD",{resourceGroup: resourceGroup});

        const blobStorageConstruct = new BlobStorageConstruct(this, "Blob", {resourceGroup: resourceGroup});


        const mySQLServerConstruct = new MySQLServerConstruct(this, "MySQL server", {
            resourceGroup: resourceGroup,
        });

        new MySQLDatabaseConstruct(this, "MySQL database", {
            resourceGroup: resourceGroup,
            mysqlServer: mySQLServerConstruct.mysqlServer,
        });

        new MySQLFirewallConstruct(this, "MySQL firewall", {
            resourceGroup: resourceGroup,
            mysqlServer: mySQLServerConstruct.mysqlServer,
        });

        const applicationInsightsConstruct = new ApplicationInsightsConstruct(this, "Application insights", {
            resourceGroup: resourceGroup,
        });

        const containerRegistrySConstruct = new ContainerRegistrySConstruct(
            this,
            "container registry",
            {resourceGroup: resourceGroup}
        );

        const appServicePlanConstruct = new AppServicePlanConstruct(this, "App Service Plan", {
            resourceGroup: resourceGroup,
        });

        new AppServiceConstruct(this, "App Service", {
            resourceGroup: resourceGroup,
            appServicePlan: appServicePlanConstruct.appServicePlan,
            mysqlServer: mySQLServerConstruct.mysqlServer,
        });

        const keyVaultConstruct = new KeyVaultConstruct(this, "KeyVault", {
            resourceGroup,
            storageAccount: blobStorageConstruct.storageAccount,
            servicePrincipalObjectId:azureAdConstruct.servicePrincipalObjectId
        });
        new TerraformOutput(
            this,
            "Key Vault Uri",
            {value: keyVaultConstruct.keyVault.vaultUri, sensitive: true}
        );
        new TerraformOutput(
            this,
            "Storage Account Name",
            {value: blobStorageConstruct.storageAccount.name, sensitive: true}
        );
        new TerraformOutput(
            this,
            "Storage Account Key",
            {value: blobStorageConstruct.storageAccount.primaryAccessKey, sensitive: true}
        );
        new TerraformOutput(
            this,
            "Storage Account Connection String",
            {value: blobStorageConstruct.storageAccount.primaryConnectionString, sensitive: true}
        );

        new TerraformOutput(
            this,
            "MySQL Server Hostname",
            {value: mySQLServerConstruct.mysqlServer.fqdn, sensitive: true}
        );
        new TerraformOutput(
            this,
            "MySQL Server Identity",
            {value: mySQLServerConstruct.mysqlServer.identity, sensitive: true}
        );

        new TerraformOutput(
            this,
            "Application Insights Key",
            {value: applicationInsightsConstruct.applicationInsights.instrumentationKey, sensitive: true}
        );

        new TerraformOutput(
            this,
            "Application Insights Connection String",
            {value: applicationInsightsConstruct.applicationInsights.connectionString, sensitive: true}
        );

        new TerraformOutput(
            this,
            "Container Registry Admin Username",
            {value: containerRegistrySConstruct.containerRegistry.adminUsername, sensitive: true}
        );

        new TerraformOutput(
            this,
            "Container Registry Admin Password",
            {value: containerRegistrySConstruct.containerRegistry.adminPassword, sensitive: true}
        );

        new TerraformOutput(
            this,
            "Container Registry Identity",
            {value: containerRegistrySConstruct.containerRegistry.identity, sensitive: true}
        );

        new TerraformOutput(
            this,
            "App Service Plan Name",
            {value: appServicePlanConstruct.appServicePlan.name, sensitive: true}
        );

        new TerraformOutput(
            this,
            "Service Principal Password",
            {value: azureAdConstruct.servicePrincipalPassword, sensitive: true}
        );

    }
}

const app = new App();
new MainStack(app, "iShare_stack", {env: "dev"});
app.synth();
