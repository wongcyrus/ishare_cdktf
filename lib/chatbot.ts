import {Construct} from "constructs";
import {
    BotChannelsRegistration,
    BotChannelWebChat,
    DataAzurermClientConfig,
    ResourceGroup
} from "@cdktf/provider-azurerm";
import {Application} from "../.gen/providers/azuread/application";

interface ChatBotConstructConstructProps {
    resourceGroup: ResourceGroup;
}

export class ChatBotConstruct extends Construct {
    constructor(
        scope: Construct,
        name: string,
        props: ChatBotConstructConstructProps
    ) {
        super(scope, name);

        const {resourceGroup} = props;

        const dataAzureRmClientConfig = new DataAzurermClientConfig(this, "Client Config");
        const application = new Application(this, "iShare Bot Application", {
            displayName: process.env.PROJECT_NAME! + process.env.ENV + "BotWebAppApplication",
            owners: [dataAzureRmClientConfig.objectId],
        });

        // new BotWebApp(this, "iShare BotWebApp", {
        //     microsoftAppId: application.objectId,
        //     name: process.env.STORAGE_ACCOUNT_NAME! + process.env.ENV + "BotWebApp",
        //     resourceGroupName: resourceGroup.name,
        //     location: resourceGroup.location,
        //     sku: process.env.BOTWEBAPP_SKU!
        // })

        const botChannelsRegistration = new BotChannelsRegistration(this, "iShare BotChannelsRegistration", {
            microsoftAppId: application.objectId,
            name: process.env.STORAGE_ACCOUNT_NAME! + process.env.ENV + "BotWebApp",
            resourceGroupName: resourceGroup.name,
            location: "global",
            sku: process.env.BOTWEBAPP_SKU!
        });

        new BotChannelWebChat(this, "iShare BotChannelWebChat", {
            botName: botChannelsRegistration.name,
            resourceGroupName: resourceGroup.name,
            location: "global",
            siteNames: ["donor", "volunteer", "student", "teacher", "anonymous"]
        });

    }
}
