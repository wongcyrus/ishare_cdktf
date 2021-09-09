import { Construct } from "constructs";
import { AppServicePlan, ResourceGroup } from "@cdktf/provider-azurerm";

interface AppServicePlanStackProps {
  app_plan_rg: ResourceGroup;
}

export class AppServicePlanConstruct extends Construct {
  public readonly app_service_plan: AppServicePlan;

  constructor(scope: Construct, name: string, props: AppServicePlanStackProps) {
    super(scope, name);

    const { app_plan_rg } = props;

    // create app service plan
    this.app_service_plan = new AppServicePlan(this, "iShare lib app plan", {
      kind: process.env.APP_SERVICE_PLAN_KIND,
      reserved: true,
      resourceGroupName: app_plan_rg.name,
      location: app_plan_rg.location,
      name: process.env.APP_SERVICE_PLAN_NAME! + process.env.SUFFIX,
      sku: [
        {
          size: process.env.APP_SERVICE_PLAN_SIZE!,
          tier: process.env.APP_SERVICE_PLAN_TIER!,
        },
      ],
      dependsOn: [app_plan_rg],
      tags: JSON.parse(process.env.TAG!),
      // tags: <{ [key: string]: string }>(<unknown>process.env.TAG!),
      // tags: <{ [key: string]: string }>process.env.TAG!,
    });
  }
}
