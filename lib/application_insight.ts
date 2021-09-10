import {Construct} from "constructs";
import {ApplicationInsights, ResourceGroup} from "@cdktf/provider-azurerm";

interface ApplicationInsightsStackProps {
    ai_rg: ResourceGroup;
}

export class ApplicationInsightsConstruct extends Construct {
    public readonly application_insights: ApplicationInsights;

    constructor(
        scope: Construct,
        name: string,
        props: ApplicationInsightsStackProps
    ) {
        super(scope, name);

        const {ai_rg} = props;

        // create application insights
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/application_insights#attributes-reference
        this.application_insights = new ApplicationInsights(
            this,
            "iShare lib application_insights",
            {
                name: process.env.APPLICATION_INSIGHTS_NAME! + process.env.SUFFIX,
                applicationType: process.env.APPLICATION_INSIGHTS_TYPE!,
                resourceGroupName: ai_rg.name,
                location: ai_rg.location,
                dependsOn: [ai_rg],
                tags: JSON.parse(process.env.TAG!),
            }
        );
    }
}
