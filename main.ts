import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AzurermProvider } from "@cdktf/provider-azurerm";
import { DevStack } from "./dev/developing";
import "./dev/dev-config";

class iShareStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    console.log(process.env.RESOURCE_GROUP_NAME);
    // console.log(config.parsed.RESOURCE_GROUP_NAME);

    new AzurermProvider(this, "azure_feature", {
      features: [{}],
      skipProviderRegistration: true,
    });

    new DevStack(app, "dev");
  }
}

const app = new App();
new iShareStack(app, "iShare_stack");
app.synth();
