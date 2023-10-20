import App from "./App.tsx";

class ExamplePlugin {

    public init(sageContext: any) {
        sageContext.addComponent(App)
    }
}

// @ts-ignore
window.registerPlugin(new ExamplePlugin())