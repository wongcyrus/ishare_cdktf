import {Construct} from "constructs";
import {AppServicePlan, ResourceGroup} from "@cdktf/provider-azurerm";

interface AppServicePlanConstructProps {
    resourceGroup: ResourceGroup;
}

export class AppServicePlanConstruct extends Construct {
    public readonly appServicePlan: AppServicePlan;

    constructor(scope: Construct, name: string, props: AppServicePlanConstructProps) {
        super(scope, name);

        const {resourceGroup} = props;

        // create app service plan
        this.appServicePlan = new AppServicePlan(this, "iShare lib app plan", {
            name: process.env.PROJECT_NAME! + process.env.ENV,
            kind: process.env.APP_SERVICE_PLAN_KIND,
            reserved: true,
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            sku: [
                {
                    size: process.env.APP_SERVICE_PLAN_SIZE!,
                    tier: process.env.APP_SERVICE_PLAN_TIER!,
                },
            ],
            dependsOn: [resourceGroup],
            tags: {"environment": process.env.ENV!, "created_by": process.env.CREATED_BY!},
        });
    }
}
