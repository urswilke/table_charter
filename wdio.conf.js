// Urs own objects:
import fs from "fs-extra";
import * as path from "path";
const debug = process.env.DEBUG;
const defaultTimeoutInterval = 10000;

const timeout = debug ? 24 * 60 * 60 * 1000 : defaultTimeoutInterval;
const downloadDir = path.resolve("src/test/output");

const chrome_capabilities = {
    browserName: "chrome",
    "goog:chromeOptions": {
        args: [
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-background-networking",
            "--enable-features=NetworkService,NetworkServiceInProcess",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-client-side-phishing-detection",
            "--disable-component-extensions-with-background-pages",
            "--disable-default-apps",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-features=TranslateUI,BlinkGenPropertyTrees",
            "--disable-hang-monitor",
            "--disable-ipc-flooding-protection",
            "--disable-popup-blocking",
            "--disable-prompt-on-repost",
            "--disable-renderer-backgrounding",
            "--disable-sync",
            "--force-color-profile=srgb",
            "--metrics-recording-only",
            "--no-first-run",
            "--enable-automation",
            "--password-store=basic",
            "--use-mock-keychain",
        ],
        prefs: {
            "download.default_directory": downloadDir,
        },
        logPath: "src/test/logs.txt",
    },
};

const firefox_capabilities = {
    browserName: "firefox",
    "moz:firefoxOptions": {
        args: ["-headless"],
        prefs: {
            "browser.download.dir": downloadDir,
            "browser.download.folderList": 2,
            "browser.download.manager.showWhenStarting": false,
            "browser.helperApps.neverAsk.saveToDisk": "*/*",
        },
        // "outputDir": downloadDir,
    },
};
console.log(process.argv);
let capabilities;
switch (true) {
    case process.argv.includes("--firefox"):
        capabilities = firefox_capabilities;
        break;
    case process.argv.includes("--chrome"):
        capabilities = chrome_capabilities;
        break;
    case process.argv.includes("--edge"):
    default:
        console.log("no browser specified - using firefox");
        capabilities = firefox_capabilities;
        break;
}

export const config = {
    // Urs config:
    execArgv: debug ? ["--inspect"] : [],
    onPrepare: function (config, capabilities) {
        // make sure download directory exists
        if (fs.existsSync(downloadDir)) {
            // if it doesn't exist, create it
            fs.removeSync(downloadDir);
        }
        fs.mkdirsSync(downloadDir);
    },
    runner: [
        "browser",
        {
            preset: process.env.WDIO_PRESET,
            coverage: {
                enabled: true,
            },
        },
    ],
    specs: ["./test/**/*.test.js"],
    exclude: [],
    maxInstances: 10,
    capabilities: [capabilities],
    logLevel: "error",
    bail: 0,
    baseUrl: "",
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: "mocha",
    reporters: ["spec"],
    mochaOpts: {
        ui: "bdd",
        timeout: timeout,
    },
};
