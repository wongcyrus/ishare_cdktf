import {Construct} from "constructs";
import {TerraformStack} from "cdktf";
import {AzurermProvider, ResourceGroup,} from "@cdktf/provider-azurerm";
import {BlobStorageConstruct} from "./blob";
import {MySQLServerStack} from "./mysql_server";
import {MySQLDatabaseConstruct} from "./mysql_db";
import {MySQLFirewallConstruct} from "./mysql_db_firewall";
import {ApplicationInsightsConstruct} from "./application_insight";
import {ContainerRegistrySConstruct} from "./container_registry";
import {AppServicePlanConstruct} from "./app_service_plan";
import {AppServiceConstruct} from "./app_service";
import {OutputConstruct} from "./output";
import "./dev-config";

export class DevStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        console.log(process.env.RESOURCE_GROUP_NAME);

        new AzurermProvider(this, "azure_feature", {
            features: [{}],
            skipProviderRegistration: true,
        });

        const resourceGroup = new ResourceGroup(this, "rg", {
            name: process.env.RESOURCE_GROUP_NAME!,
            location: process.env.LOCATION!,
        })

        // using the existing resource group
        // const dataAzureResourceGroup = new DataAzurermResourceGroup(
        //     this,
        //     "existing resource group",
        //     {name: process.env.RESOURCE_GROUP_NAME!}
        // );

        new BlobStorageConstruct(this, "Blob", {bs_rg: resourceGroup});

        const mysql_server = new MySQLServerStack(this, "MySQL server", {
            sql_rg: resourceGroup,
        });

        new MySQLDatabaseConstruct(this, "MySQL Database", {
            sql_rg: resourceGroup,
            mysql_server: mysql_server.server,
        });

        new MySQLFirewallConstruct(this, "MySQL firewall", {
            sql_rg: resourceGroup,
            mysql_server: mysql_server.server,
        });

        const log = new ApplicationInsightsConstruct(this, "application insights", {
            ai_rg: resourceGroup,
        });

        const container_registry = new ContainerRegistrySConstruct(
            this,
            "container registry",
            {cr_rg: resourceGroup}
        );

        const app_plan = new AppServicePlanConstruct(this, "app service plan", {
            app_plan_rg: resourceGroup,
        });

        new AppServiceConstruct(this, "app service", {
            app_rg: resourceGroup,
            app_service_plan: app_plan.app_service_plan,
            mysql_server: mysql_server.server,
        });

        new OutputConstruct(this, "output value", {
            mysql_server: mysql_server.server,
            application_insights: log.application_insights,
            docker_registry: container_registry.container_registry,
            app_plan: app_plan.app_service_plan,
        });

        // TODO: find a way for other stack read the principal_id it
        console.log(mysql_server.server.identity);
    }
}
