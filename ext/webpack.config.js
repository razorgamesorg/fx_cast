"use strict";

const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");


const sourceFileExtensions = [
    ".js", ".jsx"
  , ".ts", ".tsx"
];

module.exports = (env) => ({
    entry: {
        "background": `${env.includePath}/background/background.ts`

        // Sender apps
      , "senders/media/bundle": `${env.includePath}/senders/media/index.ts`
      , "senders/media/overlay/overlayContent": `${env.includePath}/senders/media/overlay/overlayContent.ts`
      , "senders/media/overlay/overlayContentLoader": `${env.includePath}/senders/media/overlay/overlayContentLoader.ts`
      , "senders/mirroring": `${env.includePath}/senders/mirroring.ts`

        // Shim entries
      , "shim/bundle": `${env.includePath}/shim/index.ts`
      , "shim/content": `${env.includePath}/shim/content.ts`
      , "shim/contentBridge": `${env.includePath}/shim/contentBridge.ts`

        // UI
      , "ui/popup/bundle": `${env.includePath}/ui/popup/index.tsx`
      , "ui/options/bundle": `${env.includePath}/ui/options/index.tsx`
    }
  , output: {
        filename: "[name].js"
      , path: env.outputPath
    }
  , plugins: [
        new webpack.DefinePlugin({
            "MIRRORING_APP_ID": JSON.stringify(env.mirroringAppId)
          , "APPLICATION_NAME": JSON.stringify(env.applicationName)
          , "APPLICATION_VERSION": JSON.stringify(env.applicationVersion)
        })

        // Copy static assets
      , new CopyWebpackPlugin([
            {
                from: env.includePath
              , to: env.outputPath
              , ignore: sourceFileExtensions.map(ext => `*${ext}`)
              , transform (content, path) {
                    // Access to variables in static files
                    if (path.endsWith(".json")) {
                        return Buffer.from(content.toString()
                            .replace("EXTENSION_NAME", env.extensionName)
                            .replace("EXTENSION_ID", env.extensionId)
                            .replace("EXTENSION_VERSION", env.extensionVersion)
                            .replace("CONTENT_SECURITY_POLICY", env.contentSecurityPolicy)
                            .replace("AUTHOR", env.author)
                            .replace("AUTHOR_HOMEPAGE", env.authorHomepage));
                    }

                    return content;
                }
            }
          , {
                // Copy vendor dir
                from: path.join(env.includePath, "vendor")
              , to: path.join(env.outputPath, "vendor")
            }
        ])
    ]
  , module: {
        rules: [
            {
                test: /\.(js|ts)x?$/
              , resolve: {
                    extensions: sourceFileExtensions
                }
              , include: env.includePath
              , use: {
                    loader: "ts-loader"
                }
            }
        ]
    }
  , resolve: {
        alias: {
            "react": "preact-compat"
          , "react-dom": "preact-compat"
        }
    }
});
